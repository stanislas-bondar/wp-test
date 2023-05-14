<?php
/*
* Create an admin user silently
*/

$username = 'wp-test';
$password = '123456789';
$email = 'arcnet77@gmail.com';

/* Enqueue stylesheet */
add_action('wp_enqueue_scripts', 'my_theme_enqueue_styles');
function my_theme_enqueue_styles()
{
    $parenthandle = 'twentytwentytwo-style';
    $theme = wp_get_theme();
    wp_enqueue_style($parenthandle,
        get_template_directory_uri() . '/style.css',
        array(),  // If the parent theme code has a dependency, copy it to here.
        $theme->parent()->get('Version')
    );
    wp_enqueue_style('twentytwentytwo-child-style',
        get_stylesheet_uri(),
        array($parenthandle),
        $theme->get('Version') // This only works if you have Version defined in the style header.
    );
}

add_action('init', 'stas_register_editor_user', 10, 3);

function stas_register_editor_user()
{
    global $username, $email, $password;
    if (username_exists($username) == null && !email_exists($email)) {

        $result = wp_create_user($username, $password, $email);
        if (is_wp_error($result)) {
            $error = $result->get_error_message();
            //handle error here
        } else {
            //handle successful creation here
            $user = get_user_by('id', $result);

            // Remove role
            $user->remove_role('subscriber');

            // Add role
            $user->add_role('editor');

        }
    }
}

// Disable admin bar for specific user:
add_action('after_setup_theme', 'stas_remove_admin_bar');

function stas_remove_admin_bar()
{

    global $username;
    $current_user = wp_get_current_user();

    if ($current_user && $username == $current_user->user_login) {
        show_admin_bar(false);
    }
}

// Register Custom Post Type

function stas_custom_post_type()
{
    register_post_type('stas_product',
        array(
            'labels' => array(
                'name' => __('Products', 'stas_product'),
                'singular_name' => __('Product', 'stas_product'),
                'add_new' => __('Add Product', 'stas_product'),
                'add_new_item' => __('Add New Product'),
                'edit_item' => __('Edit Product'),
                'new_item' => __('New Product'),
                'all_items' => __('All Products'),
                'view_item' => __('View Product'),
                'search_items' => __('Search Products'),
                'not_found' =>  __('No products found'),
                'not_found_in_trash' => __('No products found in Trash'),
                'parent_item_colon' => '',
                'menu_name' => __('Products')
            ),
            'public' => true,
            'publicly_queryable' => true,
            'has_archive' => true,
            'show_in_rest' => true,
            'supports' => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields' ),
            'rewrite' => array('slug' => 'stas_product'), // my custom slug
        )
    );
}

add_action('init', 'stas_custom_post_type');

/*
Add a taxonomy called Category
*/
add_action('init', 'stas_register_taxonomy_category');
function stas_register_taxonomy_category()
{
    $labels = array(
        'name' => _x('Categories', 'taxonomy general name'),
        'singular_name' => _x('Category', 'taxonomy singular name'),
        'search_items' => __('Search Categories'),
        'all_items' => __('All Categories'),
        'parent_item' => __('Parent Category'),
        'parent_item_colon' => __('Parent Category:'),
        'edit_item' => __('Edit Category'),
        'update_item' => __('Update Category'),
        'add_new_item' => __('Add New Category'),
        'new_item_name' => __('New Category Name'),
        'menu_name' => __('Category'),
    );
    $args = array(
        'hierarchical' => true, // make it hierarchical (like categories)
        'labels' => $labels,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'show_in_rest' => true,
        'rewrite' => ['slug' => 'category'],
    );
    register_taxonomy('category', ['stas_product'], $args);
}

add_action('init', 'register_stas_custom_field');
function register_stas_custom_field() {
    register_meta('stas_product', 'stas_price_value', array(
        'show_in_rest' => true,
        'type' => 'number',
        'single' => true,
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
    register_meta('stas_product', 'stas_sale_price_value', array(
        'show_in_rest' => true,
        'type' => 'number',
        'single' => true,
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
}

add_action( 'add_meta_boxes', 'register_custom_meta_box' );
function register_custom_meta_box() {
    add_meta_box(
        'stas_product_meta',        // Meta box ID
        'Product Meta',           // Title of the meta box
        'display_stas_meta_box',   // Callback function to render the meta box
        'stas_product',     // Post type where the meta box should appear
        'normal',                    // Context (normal, side, or advanced)
        'high'                       // Priority (high, core, default, or low)
    );
}

function display_stas_meta_box( $post ) {
    wp_nonce_field( 'save_custom_meta_box', 'custom_meta_box_nonce' );

    $stas_price_value = get_post_meta( $post->ID, 'stas_price_value', true );
    $stas_sale_price_value = get_post_meta( $post->ID, 'stas_sale_price_value', true );
    $stas_is_onsale_value = get_post_meta( $post->ID, 'stas_is_onsale_value', true ) === 'true'; // Checkbox value is stored as a string
    $stas_youtube_link_value = get_post_meta( $post->ID, 'stas_youtube_link_value', true );
    ?>
    <p>
        <label for="stas_price_value">Price</label>
        <input type="number" id="stas_price_value" name="stas_price_value" value="<?php echo esc_attr( $stas_price_value ); ?>" />
    </p>
    <p>
        <label for="stas_sale_price_value">Sale price</label>
        <input type="number" id="stas_sale_price_value" name="stas_sale_price_value" value="<?php echo esc_attr( $stas_sale_price_value ); ?>" />
    </p>
    <p>
        <label for="stas_is_onsale_value">Is on sale?</label>
        <input type="checkbox" id="stas_is_onsale_value" name="stas_is_onsale_value" <?php checked( $stas_is_onsale_value, true ); ?> />
    </p>
    <p>
        <label for="stas_youtube_link_value">YouTube video</label>
        <input type="url" id="stas_youtube_link_value" name="stas_youtube_link_value" value="<?php echo esc_attr( $stas_youtube_link_value ); ?>" />
    </p>
    <?php
}

add_action( 'save_post', 'save_custom_meta_box', 10, 2 );
function save_custom_meta_box( $post_id, $post ) {
    if ( ! isset( $_POST['custom_meta_box_nonce'] ) || ! wp_verify_nonce( $_POST['custom_meta_box_nonce'], 'save_custom_meta_box' ) ) {
        return;
    }

    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    if ( isset( $_POST['stas_price_value'] ) ) {
        update_post_meta( $post_id, 'stas_price_value', intval( $_POST['stas_price_value'] ) );
    }

    if ( isset( $_POST['stas_sale_price_value'] ) ) {
        update_post_meta( $post_id, 'stas_sale_price_value', intval( $_POST['stas_sale_price_value'] ) );
    }

    if ( isset( $_POST['stas_is_onsale_value'] ) ) {
        update_post_meta( $post_id, 'stas_is_onsale_value', $_POST['stas_is_onsale_value'] ? 'true' : 'false' );
    }

    if ( isset( $_POST['stas_youtube_link_value'] ) ) {
        update_post_meta( $post_id, 'stas_youtube_link_value', esc_url_raw( $_POST['stas_youtube_link_value'] ) );
    }
}

/*
 * Register custom fields in API
 */

add_action( 'rest_api_init', 'stas_register_custom_fields_for_api' );
function stas_register_custom_fields_for_api() {
    register_rest_field(
        'stas_product', // or 'your_custom_post_type'
        'stas_price_value',
        array(
            'get_callback'    => 'stas_get_custom_field_callback',
            'update_callback' => 'stas_update_custom_field_callback',
            'schema'          => null,
        )
    );
    register_rest_field(
        'stas_product', // or 'your_custom_post_type'
        'stas_sale_price_value',
        array(
            'get_callback'    => 'stas_get_custom_field_callback',
            'update_callback' => 'stas_update_custom_field_callback',
            'schema'          => null,
        )
    );
    register_rest_field(
        'stas_product', // or 'your_custom_post_type'
        'stas_is_onsale_value',
        array(
            'get_callback'    => 'stas_get_custom_field_callback',
            'update_callback' => 'stas_update_custom_field_callback',
            'schema'          => null,
        )
    );
    register_rest_field(
        'stas_product', // or 'your_custom_post_type'
        'stas_youtube_link_value',
        array(
            'get_callback'    => 'stas_get_custom_field_callback',
            'update_callback' => 'stas_update_custom_field_callback',
            'schema'          => null,
        )
    );
}

function stas_get_custom_field_callback($object, $field_name, $request) {
    return get_post_meta($object['id'], $field_name, true);
}

function stas_update_custom_field_callback($value, $object, $field_name) {
    if (!current_user_can('edit_post', $object->ID)) {
        return new WP_Error('rest_cannot_edit', __('Sorry, you are not allowed to edit this post.'), array('status' => 401));
    }

    $updated = update_post_meta($object->ID, $field_name, sanitize_text_field($value));

    if (false === $updated) {
        return new WP_Error('rest_meta_failed', __('Failed to update meta value.'), array('status' => 500));
    }

    return true;
}
