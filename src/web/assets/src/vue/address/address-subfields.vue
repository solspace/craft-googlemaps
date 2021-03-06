<template>
    <div>
        <input
            v-for="subfield in subfieldDisplay()"
            :placeholder="subfield.label"
            :ref="(subfield.enabled ? 'autocomplete' : '')"
            v-model="$root.$data.data.address[subfield.key]"
            :class="inputClasses"
            autocomplete="chrome-off"
            :name="`fields[${handle}][${subfield.key}]`"
            :style="subfield.styles"
        />
    </div>
</template>

<script>
    import addressComponents from './../utils/address-components';
    import subfieldDisplay from './../utils/subfield-display';

    export default {
        data() {
            return {
                handle: this.$root.$data.handle,
                autocomplete: false,
                inputClasses: [
                    'text',
                    'fullwidth'
                ]
            }
        },
        mounted() {
            try {
                const google = window.google;
                const options = {
                    types: ['geocode'],
                    fields: [
                        'formatted_address',
                        'address_components',
                        'geometry.location',
                        'place_id'
                    ]
                };

                // If no subfields exist, bail
                if (!this.$refs.autocomplete) {
                    return;
                }

                // Get first subfield
                const $first = this.$refs.autocomplete[0];

                // Create an Autocomplete object
                this.autocomplete = new google.maps.places.Autocomplete($first, options);

                // Listen for autocomplete trigger
                this.autocomplete.addListener('place_changed', () => {

                    // Get newly selected place
                    let place = this.autocomplete.getPlace();

                    // Configure address data based on place
                    this.setAddressData(place);

                    // Get settings
                    let settings = this.$root.$data.settings;

                    // If not changing the map visibility, bail
                    if ('noChange' === settings.mapOnSearch) {
                        return;
                    }

                    // Change map visibility based on settings
                    this.$root.$data.settings.showMap = ('open' === settings.mapOnSearch);
                });

                // Prevent address selection from attempting to submit the form
                google.maps.event.addDomListener($first, 'keydown', (event) => {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                    }
                });

            } catch (error) {

                // Something went wrong
                console.error(error);

            }
        },
        methods: {

            // Populate address data when Autocomplete selected
            setAddressData(place) {

                // Get data object
                let data = this.$root.$data.data;

                // Get new address info
                let components = place.address_components;
                let coords = place.geometry.location;

                // Set all subfield data
                addressComponents(components, data.address);



                /**
                 * If/when the coordinates are incomplete, erase the "formatted" and "raw" values.
                 */

                // Append address meta data
                data.address['formatted'] = place.formatted_address;
                data.address['raw'] = JSON.stringify(place);

                // Set coordinates
                data.coords.lat = parseFloat(coords.lat().toFixed(7));
                data.coords.lng = parseFloat(coords.lng().toFixed(7));
            },

            // Get the display array
            subfieldDisplay() {
                // Get the subfield arrangement
                let arrangement = this.$root.$data.settings.subfieldConfig;
                // Return configured arrangement
                return subfieldDisplay(arrangement);
            }
        }
    }
</script>
