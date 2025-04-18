# Pantheon Advanced Page Cache #

**Contributors:** [getpantheon](https://profiles.wordpress.org/getpantheon), [danielbachhuber](https://profiles.wordpress.org/danielbachhuber), [kporras07](https://profiles.wordpress.org/kporras07), [jspellman](https://profiles.wordpress.org/jspellman/), [jazzs3quence](https://profiles.wordpress.org/jazzs3quence/), [ryanshoover](https://profiles.wordpress.org/ryanshoover/), [rwagner00](https://profiles.wordpress.org/rwagner00/), [pwtyler](https://profiles.wordpress.org/pwtyler)  
**Tags:** pantheon, cdn, cache  
**Requires at least:** 6.4  
**Tested up to:** 6.7.2  
**Stable tag:** 2.1.1  
**License:** GPLv2 or later  
**License URI:** http://www.gnu.org/licenses/gpl-2.0.html

Automatically clear related pages from Pantheon's Edge when you update content. High TTL. Fresh content. Visitors never wait.

## Description ##

[![Actively Maintained](https://img.shields.io/badge/Pantheon-Actively_Maintained-yellow?logo=pantheon&color=FFDC28)](https://pantheon.io/docs/oss-support-levels#actively-maintained-support)
[![Lint and Test](https://github.com/pantheon-systems/pantheon-advanced-page-cache/actions/workflows/lint-test.yml/badge.svg)](https://github.com/pantheon-systems/pantheon-advanced-page-cache/actions/workflows/lint-test.yml)
[![CircleCI](https://circleci.com/gh/pantheon-systems/pantheon-advanced-page-cache.svg?style=svg)](https://circleci.com/gh/pantheon-systems/pantheon-advanced-page-cache)

For sites wanting fine-grained control over how their responses are represented in their edge cache, Pantheon Advanced Page Cache is the golden ticket. Here's a high-level overview of how the plugin works:

1. When a response is generated, the plugin uses surrogate keys based on WordPress' main `WP_Query` object to "tag" the response with identifers for the data used in the response. See the "Adding Custom Keys" section for including your own surrogate keys.
2. When WordPress data is modified, the plugin triggers a purge request for the data's corresponding surrogate keys.

Because of its surrogate key technology, Pantheon Advanced Page Cache empowers WordPress sites with a significantly more accurate cache purge mechanism, and generally higher cache hit rate. It even works with the WordPress REST API.

Go forth and make awesome! And, once you've built something great, [send us feature requests (or bug reports)](https://github.com/pantheon-systems/pantheon-advanced-page-cache/issues).

## Installation ##

To install Pantheon Advanced Page Cache, follow these steps:

1. Install the plugin from WordPress.org using the WordPress dashboard.
2. Activate the plugin.

To install Pantheon Advanced Page Cache in one line with WP-CLI:

    wp plugin install pantheon-advanced-page-cache --activate

## How It Works ##

Pantheon Advanced Page Cache makes heavy use of surrogate keys, which enable responses to be "tagged" with identifiers that can then later be used in purge requests. For instance, a home page response might include the `Surrogate-Key` header with these keys:

    Surrogate-Key: front home post-43 user-4 post-41 post-9 post-7 post-1 user-1

Similarly, a `GET` requests to `/wp-json/wp/v2/posts` might include the `Surrogate-Key` header with these keys:

```
Surrogate-Key: rest-post-collection rest-post-43 rest-post-43 rest-post-9 rest-post-7 rest-post-1
```

Because cached responses include metadata describing the data therein, surrogate keys enable more flexible purging behavior like:

* When a post is updated, clear the cache for the post's URL, the homepage, any index view the post appears on, and any REST API endpoints the post is present in.
* When an author changes their name, clear the cache for the author's archive and any post they've authored.

There is a limit to the number of surrogate keys in a response, so we've optimized them based on a user's expectation of a normal WordPress site. See the "Emitted Keys" section for full details on which keys are included, and the "Adding Custom Keys" section following for information on how to add your own.

### Adding Custom Keys ###

By default, Pantheon Advanced Page Cache generates surrogate keys based on an interpretation of the main `WP_Query` query object. Because WordPress sends headers before the page is rendered, you need to use the `pantheon_wp_main_query_surrogate_keys` filter to include additional surrogate keys for any data present on the page.

For example, to include surrogate keys for a sidebar rendered on the homepage, you can filter the keys using the `is_home()` template tag:

```php
    /**
     * Add surrogate key for the featured content sidebar rendered on the homepage.
     */
    add_filter( 'pantheon_wp_main_query_surrogate_keys', function( $keys ){
	    if ( is_home() ) {
            $keys[] = 'sidebar-home-featured';
        }
        return $keys;
    });
```

Then, when sidebars are updated, you can use the `pantheon_wp_clear_edge_keys()` helper function to emit a purge event specific to the surrogate key:

```php
    /**
     * Trigger a purge event for the featured content sidebar when widgets are updated.
     */
    add_action( 'update_option_sidebars_widgets', function() {
        pantheon_wp_clear_edge_keys( array( 'sidebar-home-featured' ) );
    });
```

Similarly, to include surrogate keys for posts queried on the homepage, you can pre-fetch the posts before the page is rendered:

```php
    /**
     * An example of pre-fetching a WP_Query to tag the
     * response with queried data. You'd use `papcx_wp_query()`
     * a second time within your template to use the data.
     */
    add_filter( 'pantheon_wp_main_query_surrogate_keys', function( $keys ) {
        if ( is_home() ) {
            $query = papcx_wp_query( array(
                'post_type' => 'page',
            ) );
            foreach( $query->posts as $post ) {
                $keys[] = 'post-' . $post->ID;
            }
        }
        return $keys;
    });

    /**
     * Register a 'papc-non-persistent' cache group to cache data
     * in a non-persistent manner. We only want data in this group
     * to be cached within the page request.
     */
    add_action( 'init', function(){
        wp_cache_add_non_persistent_groups( array( 'papc-non-persistent' ) );
    });

    /**
     * Helper function to instantiate a WP_Query object only
     * once per page request.
     *
     * @param array $args Arguments to pass to WP_Query.
     * @return WP_Query
     */
    function papcx_wp_query( $args = array() ) {
        $cache_key = md5( serialize( $args ) );
        // WP_Query object will be in cache the second time we use the function.
        $cache_value = wp_cache_get( $cache_key, 'papc-non-persistent' );
        if ( false !== $cache_value ) {
            return $cache_value;
        }
        $query = new WP_Query( $args );
        wp_cache_set( $cache_key, $query, 'papc-non-persistent' );
        return $query;
    }
```

Because Pantheon Advanced Page Cache already handles WordPress post purge events, there's no additional call to `pantheon_wp_clear_edge_keys()`.

Lastly, the `pantheon_wp_rest_api_surrogate_keys` filter lets you filter surrogate keys present in a REST API response.

### Additional purging by path

When a post is published for the first time, the permalink's path is also purged even if it has no matching keys. This can be further filtered with the `pantheon_clear_post_path` filter.

```php
add_action('pantheon_clear_post_path', function($paths) {
    // Add or remove paths from $paths
    return $paths
}, 10, 3);
```

Need a bit more power? In addition to `pantheon_wp_clear_edge_keys()`, there are two additional helper functions you can use:

* `pantheon_wp_clear_edge_paths( $paths = array() )` - Purge cache for one or more paths.
* `pantheon_wp_clear_edge_all()` - Warning! With great power comes great responsibility. Purge the entire cache, but do so wisely.

### Ignoring Specific Post Types ###

By default, Pantheon Advanced Page Cache is pretty aggressive in how it clears its surrogate keys. Specifically, any time `wp_insert_post` is called (which can include any time a post of any type is added or updated, even private post types), it will purge a variety of keys including `home`, `front`, `404` and `feed`. To bypass or override this behavior, since 1.5.0 we have a filter allowing an array of post types to ignore to be passed before those caches are purged. By default, the `revision` post type is ignored, but others can be added:

```php
/**
 * Add a custom post type to the ignored post types.
 *
 * @param array $ignored_post_types The array of ignored post types.
 * @return array
 */
function filter_ignored_posts( $ignored_post_types ) {
	$ignored_post_types[] = 'my-post-type'; // Ignore my-post-type from cache purges.
	return $ignored_post_types;
}

add_filter( 'pantheon_purge_post_type_ignored', 'filter_ignored_posts' );
```

This will prevent the cache from being purged if the given post type is updated.

### Setting the Cache Max Age with a filter

The cache max age setting is controlled by the [Pantheon Page Cache](https://docs.pantheon.io/guides/wordpress-configurations/wordpress-cache-pluginhttps://docs.pantheon.io/guides/wordpress-configurations/wordpress-cache-plugin) admin page. As of 2.0.0, there are three cache age options by default — 1 week, 1 month, 1 year. Pantheon Advanced Page Cache automatically purges the cache of updated and related posts and pages, but you might want to override the cache max age value and set it programmatically. In this case, you can use the `pantheon_cache_default_max_age` filter added in [Pantheon MU plugin 1.4.0+](https://docs.pantheon.io/guides/wordpress-configurations/wordpress-cache-plugin#override-the-default-max-age). For example:

```php
add_filter( 'pantheon_cache_default_max_age', function() {
	return 10 * DAY_IN_SECONDS;
} );
```

When the cache max age is filtered in this way, the admin option is disabled and a notice is displayed.

![Page Cache Max Age with filtered value](.wordpress-org/screenshots/page-cache-max-age-filtered.png)

### Updating the cache max age based on nonces

Nonces created on the front-end, often used to secure forms and other data, have a lifetime, and if the cache max age is longer than the nonce lifetime, the nonce may expire before the cache does. To avoid this, you can use the `pantheon_cache_nonce_lifetime` action to set the `pantheon_cache_default_max_age` to less than the nonce lifetime. For example:

```php
do_action( 'pantheon_cache_nonce_lifetime' );
```

It's important to wrap your `do_action` in the appropriate conditionals to ensure that the action is only called when necessary and not filtering the cache max age in cases when it's not necessary. This might mean only running on certain pages or in certain contexts in your code.

## WP-CLI Commands ##

This plugin implements a variety of [WP-CLI](https://wp-cli.org) commands. All commands are grouped into the `wp pantheon cache` namespace.

```
$ wp help pantheon cache

NAME

  wp pantheon cache

DESCRIPTION

  Manage the Pantheon Advanced Page Cache.

SYNOPSIS

  wp pantheon cache <command>

SUBCOMMANDS

  purge-all       Purge the entire page cache.
  purge-key       Purge one or more surrogate keys from cache.
  purge-path      Purge one or more paths from cache.
```

Use `wp help pantheon cache <command>` to learn more about each command.

## Debugging ##

By default, Pantheon's infrastructure strips out the `Surrogate-Key` response header before responses are served to clients. The contents of this header can be viewed as `Surrogate-Key-Raw` by adding on a debugging header to the request.

A direct way of inspecting headers is with `curl -I`. This command will make a request and show just the response headers. Adding `-H "Pantheon-Debug:1"` will result in `Surrogate-Key-Raw` being included in the response headers. The complete command looks like this:

```
curl -IH "Pantheon-Debug:1" https://scalewp.io/
```

Piping to `grep` will filter the output down to just the `Surrogate-Key-Raw` header:

    curl -IH "Pantheon-Debug:1" https://scalewp.io/ | grep -i Surrogate-Key-Raw

Tada!

## Emitted Keys and Purge Events ##

### Emitted Keys on Traditional Views ###

**Home `/`**

* Emits surrogate keys: `home`, `front`, `post-<id>` (all posts in main query)

**Single post `/2016/10/14/surrogate-keys/`**

* Emits surrogate keys: `single`, `post-<id>`, `post-user-<id>`, `post-term-<id>` (all terms assigned to post)

**Author archive `/author/pantheon/`**

* Emits surrogate keys: `archive`, `user-<id>`, `post-<id>` (all posts in main query)

**Term archive `/tag/cdn/`**

* Emits surrogate keys: `archive`, `term-<id>`, `post-<id>` (all posts in main query)

**Day archive `/2016/10/14/`**

* Emits surrogate keys: `archive`, `date`, `post-<id>` (all posts in main query)

**Month archive `/2016/10/`**

* Emits surrogate keys: `archive`, `date`, `post-<id>` (all posts in main query)

**Year archive `/2016/`**

* Emits surrogate keys: `archive`, `date`, `post-<id>` (all posts in main query)

**Search `/?s=<search>`**

* Emits surrogate keys: `search`, either `search-results` or `search-no-results`, `post-<id>` (all posts in main query)

**Not found (404)**

* Emits surrogate keys: `404`

**Custom Post Type Archive**

* Emits surrogate keys: `archive`, `post-type-archive`, `<custom-post-type-name>-archive`, `post-<id>`(all posts in main query)

### Emitted Keys on REST API Endpoints ###

**Posts**

* `/wp-json/wp/v2/posts` emits surrogate keys: `rest-post-collection`, `rest-post-<id>`
* `/wp-json/wp/v2/posts/<id>` emits surrogate keys: `rest-post-<id>`

**Pages**

* `/wp-json/wp/v2/pages` emits surrogate keys: `rest-page-collection`, `rest-post-<id>`
* `/wp-json/wp/v2/pages/<id>` emits surrogate keys: `rest-post-<id>`

**Categories**

* `/wp-json/wp/v2/categories` emits surrogate keys: `rest-category-collection`, `rest-term-<id>`
* `/wp-json/wp/v2/categories/<id>` emits surrogate keys: `rest-term-<id>`

**Tags**

* `/wp-json/wp/v2/tags` emits surrogate keys: `rest-post_tag-collection`, `rest-term-<id>`
* `/wp-json/wp/v2/tags/<id>` emits surrogate keys: `rest-term-<id>`

**Comments**

* `/wp-json/wp/v2/comments` emits surrogate keys: `rest-comment-collection`, `rest-comment-post-<post-id>`, `rest-comment-<id>`
* `/wp-json/wp/v2/comments/<id>` emits surrogate keys: `rest-comment-post-<post-id>`, `rest-comment-<id>`

**Users**

* `/wp-json/wp/v2/users` emits surrogate keys: `rest-user-collection`, `rest-user-<id>`
* `/wp-json/wp/v2/users/<id>` emits surrogate keys: `rest-user-<id>`

**Settings**

* `/wp-json/wp/v2/settings` emits surrogate keys: `rest-setting-<name>`

### Purge Events ###

Different WordPress actions cause different surrogate keys to be purged, documented here.

**`wp_insert_post` / `transition_post_status` / `before_delete_post` / `delete_attachment`**

* Purges surrogate keys: `home`, `front`, `404`, `post-<id>`, `user-<id>`, `term-<id>`, `rest-<type>-collection`, `rest-comment-post-<id>`, `post-type-archive`, `<custom-post-type-name>-archive`
* Affected views: homepage, single post, any page with 404 header, any archive where post displays, author archive, term archive, REST API collection and resource endpoints

**`clean_post_cache`**

* Purges surrogate keys: `post-<id>`, `rest-post-<id>`
* Affected views: single post, REST API resource endpoint

**`created_term` / `edited_term` / `delete_term`**

* Purges surrogate keys: `term-<id>`, `post-term-<id>`, `rest-<taxonomy>-collection`
* Affected views: term archive, any post where the term is assigned, REST API collection and resource endpoints

**`clean_term_cache`**

* Purges surrogate keys: `term-<id>`, `rest-term-<id>`
* Affected views: term archive, REST API resource endpoint

**`wp_insert_comment` / `transition_comment_status`**

* Purges surrogate keys: `rest-comment-collection`, `rest-comment-<id>`
* Affected views: REST API collection and resource endpoints

**`clean_comment_cache`**

* Purges surrogate keys: `rest-comment-<id>`
* Affected views: REST API resource endpoint

**`clean_user_cache`**

* Purges surrogate keys: `user-<id>`, `rest-user-<id>`
* Affected views: author archive, any post where the user is the author

**`updated_option`**

* Purges surrogate keys: `rest-setting-<name>`
* Affected views: REST API resource endpoint

## Surrogate Keys for taxonomy terms ##
Setting surrogate keys for posts with large numbers of taxonomies (such as WooCommerce products with a large number of global attributes) can suffer from slower queries. Surrogate keys can be skipped for 'product' post types' taxonomy terms (or any other criteria you see fit) with the following filter:

```php
```php
function custom_should_add_terms($should_add_terms, $wp_query) {
    if ( $wp_query->is_singular( 'product' ) ) {
        return false;
    }
    return $should_add_terms;
}
add_filter('pantheon_should_add_terms', 'custom_should_add_terms', 10, 2);
```

## Other Filters ##

### `pantheon_apc_disable_admin_notices`
Since 2.0.0, Pantheon Advanced Page Cache displays a number of admin notices about your current cache max age value. You can disable these notices with the `pantheon_apc_disable_admin_notices` filter.

```php
add_filter( 'pantheon_apc_disable_admin_notices', '__return_true' );
```

Alternately, the function callback is passed into the `pantheon_apc_disable_admin_notices` filter, allowing you to specify precisely _which_ notice to disable, for example:

```php
add_filter( 'pantheon_apc_disable_admin_notices', function( $disable_notices, $callback ) {
    if ( $callback === '\\Pantheon_Advanced_Page_Cache\\Admin_Interface\\admin_notice_maybe_recommend_higher_max_age' ) {
        return true;
    }
    return $disable_notices;
}, 10, 2 );
```

The above example would disable _only_ the admin notice recommending a higher cache max age.

## Plugin Integrations ##

Pantheon Advanced Page Cache integrates with WordPress plugins, including:

* [WPGraphQL](https://wordpress.org/plugins/wp-graphql/)

## Contributing ##

See [CONTRIBUTING.md](https://github.com/pantheon-systems/pantheon-advanced-page-cache/blob/master/CONTRIBUTING.md) for information on contributing.

## Changelog ##

### 2.1.1 (25 February 2025) ###
* Fixes 404 pages remaining cached after a post has been published ([#315](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/315))

### 2.1.0 (8 August 2024) ###
* Adds any callable functions hooked to the `pantheon_cache_default_max_age` filter to the message that displays in the WordPress admin when a cache max age filter is active. [[#292](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/292)] This gives some context to troubleshoot if the filter is active somewhere in the codebase. If an anonymous function is used, it is noted in the message that displays.
* Removes the hook to `nonce_life` and replaces it with a new action (`pantheon_cache_nonce_lifetime`, see [documentation](https://github.com/pantheon-systems/pantheon-advanced-page-cache?tab=readme-ov-file#updating-the-cache-max-age-based-on-nonces)). [[#293](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/293)] This was erroneously overriding any admin settings and setting the default cache max age for some sites to always be 23 hours (the nonce lifetime minus 1 hour). This solution requires that developers add the `do_action` when they are creating nonces on the front-end, but allows the cache settings to work as designed in all other instances.

### 2.0.0 (28 May 2024) ###
* Adds new admin alerts and Site Health tests about default cache max age settings and recommendations [[#268](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/268), [#271](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/271)]. The default Pantheon GCDN cache max age value has been updated to 1 week in the [Pantheon MU plugin](https://github.com/pantheon-systems/pantheon-mu-plugin). For more information, see the [release note](https://docs.pantheon.io/release-notes/2024/04/pantheon-mu-plugin-1-4-0-update).
* Updated UI in Pantheon Page Cache admin page when used in a Pantheon environment (with the Pantheon MU plugin). [[#272](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/272)] This UI change takes effect when [Pantheon MU plugin version 1.4.3](https://docs.pantheon.io/release-notes/2024/05/pantheon-mu-plugin-1-4-3-update) is available on your site.
* Automatically updates the cache max age to the recommended value (1 week) if it was saved at the old default value (600 seconds). [[#269](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/269)]
* Adds a hook into the `nonce_life` filter when nonces are created on the front-end to set the `pantheon_cache_default_max_age` to less than the nonce lifetime to avoid nonces expiring before the cache does. [[#282](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/282)] props [@ryanshoover](https://github.com/ryanshoover)

### 1.5.0 (March 11, 2024) ###
* Adds filter `pantheon_purge_post_type_ignored` to allow an array of post types to ignore before purging cache [[#258](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/258)]
* Adds [wpunit-helpers](https://github.com/pantheon-systems/wpunit-helpers) for running/setting up WP Unit tests

### 1.4.2 (October 16, 2023) ###
* Updates Pantheon WP Coding Standards to 2.0 [[#249](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/249)]
* Fixes an issue where a PHP warning was thrown when surrogate keys were emitted from archive pages with multiple post types. [[#252](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/252)]

### 1.4.1 (August 8, 2023) ###
* Send the REST API response header to the result and not the REST server [[#237](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/237)]. Props [@srtfisher](https://github.com/srtfisher) & [@felixarntz](https://github.com/felixarntz).

### 1.4.0 (August 1, 2023) ###
* Bumped Dependencies [[236](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/236)]
* Add filter `pantheon_should_add_terms` to allow disabling surrogate keys for posts' taxonomy terms [[239](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/239)]

### 1.3.0 (April 19, 2023) ###
* Adds support for WordPress Multisite which resolves issue where editing a Post on one subsite clears the home page cache of other sites in the Multisite install if it has a Post containing the same ID [[#228](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/228)].

### 1.2.4 (April 13, 2023) ###
* Adds surrogate key to post-type archive pages (e.g. "portfolio") that's specific to that archive(e.g. "portfolio-archive"), and clears that archive where appropriate [[#225](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/225)].

### 1.2.3 (April 5, 2023) ###
* Bump tested up to version to 6.2

### 1.2.2 (March 14, 2023) ###
* Adds PHP 8.2 compatibility [[#218](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/218)].
* Bump dependencies [[#204](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/204)].

### 1.2.1 (February 23, 2023) ###
* Handle models that are not instances of the `WPGraphQL\Model\Model` class [[#212](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/212)].
* Make dependabot target develop branch [[#209](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/209)].
* Bump dependencies [[#210](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/210)] [[#214](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/214)].

### 1.2.0 (November 29, 2022) ###
* Adds Github Actions for building tag and deploying to wp.org. Add CONTRIBUTING.md. [[#203](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/203)]

### 1.1.0 (November 1, 2022) ###
* Hook into WPGraphQL to emit surrogate keys [[#199](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/199)].
* Add Plugin Integrations section to README

### 1.0.0 (March 2, 2020) ###
* Plugin is stable.

### 0.3.1 (October 27th, 2019) ###
* Fixes reversed argument order with use of `implode()` [[#139](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/139)].
* Various PHPCS cleanup [[#127](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/127)].

### 0.3.0 (November 27th, 2017) ###
* Emits '404' surrogate key on 404s; purges when purging the homepage [[#107](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/107)].
* Adds more specific filters for modifying surrogate keys in different contexts [[#109](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/109)].
* Cleans up codebase according to WordPress Coding Standards [[#110](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/110), [#116](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/116)].

### 0.2.1 (October 25th, 2017) ###
* Ensures use of `?_embed` emits correct surrogate keys [[#103](https://github.com/pantheon-systems/pantheon-advanced-page-cache/pull/103)].

### 0.2.0 (August 10th, 2017) ###
* Automatically trims large lists of surrogate keys that break Nginx and Varnish limits for header size.

### 0.1.5 (May 24th, 2017) ###
* Disables emitting surrogate keys for the admin, unless explicitly added by filter.

### 0.1.4 (March 7th, 2017) ###
* Emits `feed` surrogate key for RSS feeds, and purges when posts are created, modified, or deleted.

### 0.1.3 (March 1st, 2017) ###
* Prevents error notices by only accessing `$rest_base` property of post types and taxonomies when set.

### 0.1.2 (December 6th, 2016) ###
* Permits admins to flush cache for a specific page if the `delete_others_posts` capability has been deleted.

### 0.1.1 (November 30th, 2016) ###
* Drops settings UI in favor of including it in Pantheon's WordPress upstream.

### 0.1.0 (November 23rd, 2016) ###
* Initial release.

## Upgrade Notice ##

### 2.0.0 ###
This release requires a minimum WordPress version of 6.4.0. It uses Site Health checks and the `wp_admin_notices` function to alert users to the new cache max-age default settings and recommendations. The plugin will still function with earlier versions, but you will not get the benefit of the alerts and Site Health checks.

This version also automatically updates the cache max age (set in the [Pantheon Page Cache settings](https://docs.pantheon.io/guides/wordpress-configurations/wordpress-cache-plugin)) to the recommended value (1 week) if it was saved at the old default value (600 seconds). If the cache max age was set to any other value (or not set at all), it will not be changed. A one-time notice will be displayed in the admin interface to inform administrators of this change.

### 1.3.0 ###
Note that the Pantheon Advanced Page Cache 1.3.0 release now prefixes keys on a WordPress Multisite (WPMS) with the blog ID. For users who already have this plugin installed on a WPMS, they will need to click the Clear Cache button on the settings page to generate the prefixed keys.
