<?php
/**
 * Plugin Name:       Stas Admin Plugin
 * Description:       Post Editor Page.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Stas Bondar
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       stas-plugin
 *
 * @package           stas
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function stn_stas_plugin_block_init() {
	register_block_type( __DIR__ . '/build/admin.asset.php' );
}

add_action( 'init', 'stn_stas_plugin_block_init' );
function stn_stas_plugin_block_categories( $categories ) {
	return array_merge(
		$categories,
		[
			[
				'slug'  => 'stas-blocks',
				'title' => __( 'Stas Blocks', 'stas-boilerplate' ),
			],
		]
	);
}
add_action( 'block_categories', 'stn_stas_plugin_block_categories', 10, 2 );

function stn_stas_plugin_settings_page() {
	add_options_page(
		__( 'Stas Admin Plugin Settings', 'wholesome-plugin' ),
		__( 'Stas Admin Settings', 'wholesome-plugin' ),
		'manage_options',
		'stas_plugin_settings',
		function() {
			?>
			<div id="root_id"></div>
			<?php
		}
	);
}
add_action( 'admin_menu', 'stn_stas_plugin_settings_page', 10 );

function stn_stas_plugin_admin_scripts() {
	$dir = __DIR__;

	$script_asset_path = "$dir/build/admin.asset.php";
	if ( ! file_exists( $script_asset_path ) ) {
		throw new Error(
			'You need to run `npm start` or `npm run build` first.'
		);
	}
	$admin_js     = 'build/admin.js';
	$script_asset = require( $script_asset_path );
	wp_enqueue_script(
		'stas--plugin-admin-editor',
		plugins_url( $admin_js, __FILE__ ),
		$script_asset['dependencies'],
		$script_asset['version']
	);
	wp_set_script_translations( 'stas--plugin-block-editor', 'wholesome-plugin' );

	$admin_css = 'build/admin.css';
	wp_enqueue_style(
		'stas--plugin-admin',
		plugins_url( $admin_css, __FILE__ ),
		['wp-components'],
		filemtime( "$dir/$admin_css" )
	);
}
add_action( 'admin_enqueue_scripts', 'stn_stas_plugin_admin_scripts', 10 );
