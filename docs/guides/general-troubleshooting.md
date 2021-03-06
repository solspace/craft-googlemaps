# General Troubleshooting

:::warning Enable devMode

While building your maps, we highly recommend enabling the [`devMode` config setting](https://craftcms.com/docs/3.x/config/config-settings.html#devmode).

With `devMode` enabled, you will see a much more detailed output in the JavaScript console each time a map is rendered:
:::

<img class="dropshadow" :src="$withBase('/images/getting-started/console.png')" alt="Example of console output when a map is rendered" style="max-width:772px">

## The map isn't visible

If you see the words "Loading Map", _skip to the next answer._

If you **don't** see the words "Loading Map":

- Is the map height being set properly?
- Is the map being hidden due to CSS?

Check your DOM to see if the map container has been generated. If it has, then you're probably facing a simple CSS issue. By default, the height of a div will be zero... So even though the container is there, it isn't visible.

**Ways to fix it:**
 - Add a height value to your map options.
 - Set the height of `.gm-map` in your CSS.

:::tip More Info
Check out the guide about [Setting the Map Height...](/guides/setting-map-height/)
:::

## It says "Loading Map" instead of showing the map

Sounds like something went wrong with the JavaScript. Open up your browser's console and start troubleshooting.

- Did some unrelated JS fail, preventing the plugin from operating properly?
- Was the `maps.googleapis.com/maps/api/js` file referenced properly?
- Were the `googlemaps.js` and `dynamicmap.js` files loaded properly?

If the assets aren't being loaded properly, see the next answer.

## Assets aren't being loaded properly

Caching can often lead to issues with missing assets. Be sure that the JS files you need are all being referenced properly.

It's possible to have a more granular control over how and when the necessary assets get loaded. They can be loaded manually or automatically, or the automatic loading can be suppressed.

:::tip More Info
Check out the guide about [Required JS Assets...](/guides/required-js-assets/)
:::

## Geocoding is focused on the wrong location

If your [proximity search](/proximity-search/) or [address lookup](/geocoding/) is centering on the wrong location, it's possible that Google is getting confused by that particular search query. To correct for this, you can force the API to hone in on a more specific geographical region.

:::tip More Info
Check out the guide about [Region Biasing...](/guides/region-biasing/)
:::
