// Dynamic Map model for Google Maps plugin
function DynamicMap(locations, options) {

    // Safely omit both parameters
    locations = locations || [];
    options = options || {};

    // Initialize properties
    this.id = null;
    this.div = null;
    this._map = null;
    this._bounds = null;

    // Initialize collections
    this._markers = {};
    this._infoWindows = {};
    this._kmls = {};

    // Initialize defaults
    this._d = {};

    // ========================================================================= //

    // Create a new map object
    this.__construct = function(locations, options) {

        // Ensure options are valid
        options = options || {};

        // If no map ID was specified, generate one
        this.id = options.id || this._generateId('map');

        // Get map container
        this.div = document.getElementById(options.id);

        // If container does not exist
        if (!this.div) {
            // Create new container from scratch
            this.div = document.createElement('div');
        }

        // Configure map container
        this.div.id = this.id;
        this.div.classList.add('gm-map');
        this.div.style.display = 'block';

        // Set defaults (with fallbacks)
        this._d.zoom              = options.zoom              || 4;
        this._d.center            = options.center            || null;
        this._d.markerOptions     = options.markerOptions     || {};
        this._d.infoWindowOptions = options.infoWindowOptions || {};

        // Optionally set container height
        if (options.height) {
            this.div.style.height = `${options.height}px`;
        }

        // Optionally set width of container
        if (options.width) {
            this.div.style.width = `${options.width}px`;
        }

        // Create a new Google Map object
        this._createMap(options.mapOptions || {});

        // Optionally set styles of map
        if (options.styles) {
            this.styles(options.styles);
        }

        // If locations were specified, add markers
        // (using default markerOptions & infoWindowOptions)
        if (locations) {
            this.markers(locations);
        }

        // Fit map to marker boundaries
        this.fit();

        // Optionally zoom the map
        if (options.zoom) {
            this.zoom(options.zoom);
        }

        // Optionally center the map
        if (options.center) {
            this.center(options.center);
        }
    };

    // ========================================================================= //

    // Add a set of markers to the map
    this.markers = function(locations, options) {

        // If no locations, bail
        if (!locations) {
            return;
        }

        // Ensure options are valid
        options = options || {};

        // Ensure marker options are valid
        options.markerOptions = options.markerOptions
            || this._d.markerOptions
            || {};

        // Ensure info window options are valid
        options.infoWindowOptions = options.infoWindowOptions
            || this._d.infoWindowOptions
            || {};

        // Set map
        options.markerOptions.map = this._map;

        // If icon specified, copy into markerOptions
        if (options.icon) {
            options.markerOptions.icon = options.icon;
        }

        // Force locations to be an array structure
        if (!Array.isArray(locations)) {
            locations = [locations];
        }

        // Loop through all locations
        for (var i in locations) {

            // Get individual coordinates
            var coords = locations[i];

            // If coordinates are not valid, skip
            if (!coords.hasOwnProperty('lat') || !coords.hasOwnProperty('lng')) {
                continue;
            }

            // Get marker ID or generate a random one
            coords.id = options.id || coords.id || this._generateId('marker');

            // Create a new marker
            this._createMarker(coords, options.markerOptions);

            // If content provided, create a new info window
            if (options.infoWindowOptions.content) {
                this._createInfoWindow(coords, options.infoWindowOptions);
            }

        }

        // Keep the party going
        return this;
    };

    // Add a KML layer to the map
    this.kml = function(url, options) {

        // Ensure options are valid
        options = options || {};

        // Apply file URL
        options.url = options.url || url;

        // Set map
        options.map = this._map;

        // Create a new KML layer
        this._createKml(url, options);

        // Keep the party going
        return this;
    };

    // ========================================================================= //

    // Apply a batch of styles to the map
    this.styles = function(styleSet) {

        // Ensure styles are valid
        styleSet = styleSet || {};

        // Log status
        if (googleMaps.log) {
            console.log(`Styling map "${this.id}"`);
        }

        // Apply collection of styles
        this._map.setOptions({styles: styleSet});

        // Keep the party going
        return this;
    };

    // Zoom map to specified level
    this.zoom = function(level) {

        // Ensure level is valid
        level = level || this._d.zoom;

        // Log status
        if (googleMaps.log) {
            console.log(`Zooming map "${this.id}" to level`, level);
        }

        // Pass object to callback function
        var mapObject = this;

        // Set zoom level of current map
        mapObject._map.setZoom(level);

        // Repeat after fitbounds has finished (if it's running)
        google.maps.event.addListenerOnce(this._map, 'bounds_changed', function() {
            mapObject._map.setZoom(level);
        });

        // Update default zoom level
        this._d.zoom = level;

        // Keep the party going
        return this;
    };

    // Center the map on a set of coordinates
    this.center = function(coords) {

        // Ensure coordinates are valid
        coords = coords || this._d.center || this._bounds.getCenter();

        // Log status
        if (googleMaps.log) {
            console.log(`Centering map "${this.id}" on coordinates`, coords);
        }

        // Pass object to callback function
        var mapObject = this;

        // Re-center current map
        mapObject._map.setCenter(coords);

        // Repeat after bounds have changed (if they are still changing)
        google.maps.event.addListenerOnce(mapObject._map, 'bounds_changed', function() {
            mapObject._map.setCenter(coords);
        });

        // Update default center coordinates
        this._d.center = coords;

        // Keep the party going
        return this;
    };

    // Fit map according to bounds
    this.fit = function() {

        // Log status
        if (googleMaps.log) {
            console.log(`Fitting map "${this.id}" to existing boundaries`);
        }

        // Pass object to callback function
        var mapObject = this;

        // Fit bounds of current map
        mapObject._map.fitBounds(mapObject._bounds);

        // Keep the party going
        return this;
    };

    // Refresh the map
    this.refresh = function() {

        // Log status
        if (googleMaps.log) {
            console.log(`Refreshing map "${this.id}"`);
        }

        // Refresh the current map
        google.maps.event.trigger(this._map, 'resize');

        // Keep the party going
        return this;
    };

    // ========================================================================= //

    // Pan map to center on a specific marker
    this.panToMarker = function(markerId) {

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", panning to marker "${markerId}"`);
        }

        // Get specified marker
        var marker = this.getMarker(markerId);

        // If invalid marker, bail
        if (!marker) {
            console.warn(`[GM] Unable to pan to marker "${markerId}"`);
            return this;
        }

        // Pass object to callback function
        var mapObject = this;

        // Pan map to marker position
        mapObject._map.panTo(marker.position);

        // Repeat after bounds have changed (if they are still changing)
        google.maps.event.addListenerOnce(mapObject._map, 'bounds_changed', function() {
            mapObject._map.panTo(marker.position);
        });

        // Keep the party going
        return this;
    };

    // Set the icon of an existing marker
    this.setMarkerIcon = function(markerId, icon) {

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", setting icon for marker "${markerId}":`, icon);
        }

        // Get specified marker
        var marker = this.getMarker(markerId);

        // If invalid marker, bail
        if (!marker) {
            console.warn(`[GM] Unable to set icon of marker "${markerId}"`);
            return this;
        }

        // Set marker icon
        marker.setIcon(icon);

        // Keep the party going
        return this;
    };

    // Hide a marker
    this.hideMarker = function(markerId) {

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", hiding marker "${markerId}"`);
        }

        // Get specified marker
        var marker = this.getMarker(markerId);

        // If invalid marker, bail
        if (!marker) {
            console.warn(`[GM] Unable to hide marker "${markerId}"`);
            return this;
        }

        // Detach marker from map
        marker.setMap(null);

        // Keep the party going
        return this;
    };

    // Show a marker
    this.showMarker = function(markerId) {

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", showing marker "${markerId}"`);
        }

        // Get specified marker
        var marker = this.getMarker(markerId);

        // If invalid marker, bail
        if (!marker) {
            console.warn(`[GM] Unable to show marker "${markerId}"`);
            return this;
        }

        // Attach marker to current map
        marker.setMap(this._map);

        // Keep the party going
        return this;
    };

    // ========================================================================= //

    // Get a specific Google Maps marker object
    this.getMarker = function(markerId) {

        // Log status
        if (googleMaps.log) {
            console.log(`From map "${this.id}", getting existing marker "${markerId}"`);
        }

        // Get existing marker
        var marker = this._markers[markerId];

        // If marker does not exist, emit warning
        if (!marker) {
            console.warn(`[GM] Unable to find marker "${markerId}"`);
        }

        // Return marker
        return marker;
    };

    // Get a specific Google Maps info window object
    this.getInfoWindow = function(infoWindowId) {

        // Log status
        if (googleMaps.log) {
            console.log(`From map "${this.id}", getting existing info window "${infoWindowId}"`);
        }

        // Get existing info window
        var infoWindow = this._infoWindows[infoWindowId];

        // If info window does not exist, emit warning
        if (!infoWindow) {
            console.warn(`[GM] Unable to find info window "${infoWindowId}"`);
        }

        // Return info window
        return infoWindow;
    };

    // ========================================================================= //

    // Generate a complete map element
    this.tag = function(options) {

        // Log status
        if (googleMaps.log) {
            console.log(`Rendering map "${this.id}"`);
        }

        // Get the ID of the parent container
        var parentId = (options.parentId || null);

        // If no valid parent container specified
        if (!parentId || 'string' !== typeof parentId) {

            // Log status
            if (googleMaps.log) {
                console.log(`Finished initializing map "${this.id}" as a detached element 👍`);
            }

            // Check the container height
            this._checkHeight();

            // Return the element as-is
            return this.div;

        }

        // Get specified parent container
        var parent = document.getElementById(parentId);

        // If parent container exists, populate it
        if (parent) {
            parent.appendChild(this.div);
        } else {
            console.warn(`[GM] Unable to find target container #${parentId}`);
        }

        // Log status
        if (googleMaps.log) {
            console.log(`Finished initializing map "${this.id}" in container "${parentId}" 👍`);
        }

        // Check the container height
        this._checkHeight();

        // Return map container
        return this.div;
    };

    // ========================================================================= //

    // Create a new map object
    this._createMap = function(mapOptions) {

        // Log status
        if (googleMaps.log) {
            console.log(`Creating map "${this.id}"`);
        }

        // Initialize map data
        this._map = new google.maps.Map(this.div, mapOptions);
        this._bounds = new google.maps.LatLngBounds();

    };

    // Create a new marker object
    this._createMarker = function(coords, markerOptions) {

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", adding marker "${coords.id}"`);
        }

        // Set marker position based on coordinates
        markerOptions.position = coords;

        // Extend map boundaries
        this._bounds.extend(coords);

        // Initialize marker object
        this._markers[coords.id] = new google.maps.Marker(markerOptions);

    };

    // Create a new info window object
    this._createInfoWindow = function(coords, infoWindowOptions) {

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", adding info window "${coords.id}"`);
        }

        // Get related marker
        var marker = this._markers[coords.id];

        // If no related marker exists, bail
        if (!marker) {
            return;
        }

        // Get the map which contains the marker
        var map = marker.getMap();

        // Initialize info window object
        this._infoWindows[coords.id] = new google.maps.InfoWindow(infoWindowOptions);

        // Pass info windows to callback function
        var infoWindows = this._infoWindows;

        // Add click event to marker
        google.maps.event.addListener(marker, 'click', function() {
            // Close all info windows
            for (var key in infoWindows) {
                infoWindows[key].close();
            }
            // Open info window for this marker
            infoWindows[coords.id].open(map, marker);
        });

    };

    // Create a new KML layer
    this._createKml = function(url, options) {

        // Get KML ID or generate a random one
        var kmlId = options.id || this._generateId('kml');

        // Log status
        if (googleMaps.log) {
            console.log(`On map "${this.id}", adding KML layer "${kmlId}"`);
        }

        // Initialize KML object
        this._kmls[kmlId] = new google.maps.KmlLayer(options);

    };

    // ========================================================================= //

    // Check the container height, emit warning if necessary
    this._checkHeight = function() {

        // If not logging, skip check
        if (!googleMaps.log) {
            return;
        }

        // Get current height of container div
        var height = this.div.scrollHeight;

        // If height is a positive number, check is successful
        if (0 < height) {
            return;
        }

        // Zero pixels tall, emit warning
        var url = 'https://plugins.doublesecretagency.com/google-maps/guides/setting-map-height/';
        console.warn(`[GM] The map is not visible because its parent container is zero pixels tall. More info: ${url}`);

    };

    // ========================================================================= //

    // Generate a random ID
    this._generateId = function(prefix) {

        // Initialize random ID
        var randomId = '';

        // Create an array of the alphabet
        var alpha = 'abcdefghijklmnopqrstuvwxyz';
        var alphabet = alpha.split('');

        // Add six randomly selected characters
        for (char = 0; char < 6; char++) {
            var i = Math.floor(Math.random() * 25);
            randomId += alphabet[i];
        }

        // Return new ID (with optional prefix)
        return (prefix ? `${prefix}-${randomId}` : randomId);
    };

    // Prepare the object
    this.__construct(locations, options);

}
