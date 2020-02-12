// Load AJAX library
var ajax = window.superagent;

// Google Maps plugin JS object
window.googleMapsPlugin = {
    // Default action url
    actionUrl: '/actions/',
    // No CSRF token by default
    csrfToken: false,
    // Whether setup has been completed
    setupComplete: false,
    // Initialize maps on page
    pageSetup: function () {
        // Configure all maps on page
        this.compileMaps();
        // Mark setup as complete!
        this.setupComplete = true;
    },
    // Determine which maps to compile
    _whichMaps: function (selection) {
        // No map containers by default
        var containers = [];
        // Switch according to how map IDs were specified
        switch (typeof selection) {
            // Individual map
            case 'string':
                containers = [document.getElementById(selection)];
                break;
            // Selection of maps
            case 'object':
                var c;
                // Add map container to collection
                for (var i in selection) {
                    c = document.getElementById(selection[i]);
                    containers.push(c);
                }
                break;
            // All maps
            case 'undefined':
                var allMaps = document.getElementsByClassName('gm-map');
                containers = Array.prototype.slice.call(allMaps);
                break;
            // Something went wrong
           default:
               containers = [];
               break;
        }
        // Return collection
        return containers;
    },
    // Render a specific map
    _renderMap: function (dna) {

        console.table(dna);

    },
    // Configure specified maps
    compileMaps: function (selection) {
        // Initialize
        var dna;
        // Get selected map containers
        var containers = this._whichMaps(selection);
        // Loop through containers
        for (var i in containers) {
            // Get map DNA
            dna = JSON.parse(containers[i].dataset.dna);
            // Render the map
            this._renderMap(dna);
        }




        // // Make object available to callback
        // var that = this;
        // // Callback function for casting a vote
        // var configureElements = function () {
        //     // Initialize data with CSRF token
        //     var data = JSON.parse(JSON.stringify(that.csrfToken));
        //     // Set data
        //     data['ids[]'] = ids;
        //     // Remove vote
        //     ajax
        //         .post(that.actionUrl+'google-maps/page/configure')
        //         .send(data)
        //         .end(function (err, res) {
        //             // If something went wrong, bail
        //             if (!res.ok) {
        //                 console.log('Error configuring Upvote elements:', err);
        //                 return;
        //             }
        //             // Get response data
        //             var data = res.body;
        //             // If no elements to configure, bail
        //             if (!data || !Array.isArray(data)) {
        //                 return;
        //             }
        //             // Declare variables for loop
        //             var entry, id, group,
        //                 tallies, upvotes, downvotes,
        //                 totalVotes, totalUpvotes, totalDownvotes;
        //             // Loop through response data
        //             for (var i in data) {
        //                 // Get entry data
        //                 entry = data[i];
        //                 // Collect matching DOM elements
        //                 group = "[data-id='"+entry['itemKey']+"']";
        //                 upvotes = document.querySelectorAll(group+".upvote-upvote");
        //                 downvotes = document.querySelectorAll(group+".upvote-downvote");
        //                 // Mark upvote & downvote icons
        //                 switch (parseInt(entry['userVote'])) {
        //                     case 1:
        //                         // Mark upvote
        //                         that._addMatchClass(upvotes);
        //                         break;
        //                     case -1:
        //                         // Mark downvote
        //                         that._addMatchClass(downvotes);
        //                         break;
        //                 }
        //                 // Set all values
        //                 upvote._setAllValues(entry);
        //             }
        //         })
        //     ;
        // };
        // // If token already exists
        // if (this.csrfToken) {
        //     // Configure DOM elements using existing token
        //     configureElements();
        // } else {
        //     // Configure DOM elements using a fresh token
        //     this.getCsrf(configureElements);
        // }
    },
    // // Cast an upvote
    // upvote: function (elementId, key) {
    //     if (this.devMode) {
    //         console.log('['+elementId+']'+(key ? ' ['+key+']' : '')+' Upvoting...');
    //     }
    //     this._vote(elementId, key, 'upvote');
    // },
    // // Cast a downvote
    // downvote: function (elementId, key) {
    //     if (this.devMode) {
    //         console.log('['+elementId+']'+(key ? ' ['+key+']' : '')+' Downvoting...');
    //     }
    //     this._vote(elementId, key, 'downvote');
    // },
    // // Remove vote
    // removeVote: function () {
    //     console.log('Vote removal is disabled.');
    // },
    // Submit AJAX with fresh CSRF token
    getCsrf: function (callback) {
        // Make object available to callback
        var that = this;
        // Fetch a new CSRF token
        ajax
            .get(this.actionUrl+'google-maps/page/csrf')
            .end(function(err, res){
                // If something went wrong, bail
                if (!res.ok) {
                    console.log('Error retrieving CSRF token:', err);
                    return;
                }
                // Set global CSRF token
                that.csrfToken = res.body;
                // Run callback
                callback();
            })
        ;
    },
    // // Cast vote
    // _vote: function (elementId, key, vote) {
    //     // If setup is not complete, bail
    //     if (!this.setupComplete) {
    //         return;
    //     }
    //     // Make object available to callback
    //     var that = this;
    //     // Callback function for casting a vote
    //     var castVote = function () {
    //         // Initialize data with CSRF token
    //         var data = JSON.parse(JSON.stringify(that.csrfToken));
    //         // Set data
    //         data['id'] = elementId;
    //         data['key'] = key;
    //         // Set vote icons
    //         var voteIcons = Sizzle('.upvote-'+vote+'-'+that._setItemKey(elementId, key));
    //         var voteMatch = that._determineMatch(voteIcons);
    //         // If matching vote has not been cast
    //         if (!voteMatch) {
    //
    //             // TODO: If downvoting is disabled, "opposites" are irrelevant
    //
    //             // Define opposite
    //             var opposite;
    //             switch (vote) {
    //                 case 'upvote': opposite = 'downvote'; break;
    //                 case 'downvote': opposite = 'upvote'; break;
    //             }
    //             // Set opposite icons
    //             var oppositeIcons = Sizzle('.upvote-'+opposite+'-'+that._setItemKey(elementId, key));
    //             var oppositeMatch = that._determineMatch(oppositeIcons);
    //             // If opposite vote has already been cast
    //             if (oppositeMatch) {
    //                 // Swap vote
    //                 var action = that.actionUrl+'google-maps/vote/swap';
    //             } else {
    //                 // Cast new vote
    //                 var action = that.actionUrl+'google-maps/vote/'+vote;
    //             }
    //             // Vote via AJAX
    //             ajax
    //                 .post(action)
    //                 .send(data)
    //                 .type('form')
    //                 .set('X-Requested-With','XMLHttpRequest')
    //                 .end(function (response) {
    //                     // Get entry data
    //                     var entry = JSON.parse(response.text);
    //                     // Set message prefix
    //                     var prefix = '['+entry.id+']'+(entry.key ? ' ['+entry.key+']' : '');
    //                     // If error was returned, log and bail
    //                     if (typeof entry === 'string') {
    //                         console.log(prefix+' '+entry);
    //                         return;
    //                     }
    //                     // If swapping vote
    //                     if (oppositeMatch) {
    //                         entry.userVote = entry.userVote * 2;
    //                         upvote._removeMatchClass(oppositeIcons);
    //                     }
    //                     // Update values & add class
    //                     upvote._setAllValues(entry);
    //                     upvote._addMatchClass(voteIcons);
    //                 })
    //             ;
    //         } else {
    //             // Unvote
    //             upvote.removeVote(elementId, key);
    //         }
    //     };
    //     // If token already exists
    //     if (this.csrfToken) {
    //         // Cast vote using existing token
    //         castVote();
    //     } else {
    //         // Cast vote using a fresh token
    //         this.getCsrf(castVote);
    //     }
    // },
    // // // Update tally
    // // _updateTally: function (elementId, key, vote) {
    // //     var tallies = Sizzle('.upvote-tally-'+this._setItemKey(elementId, key));
    // //     for (var i = 0; i < tallies.length; i++) {
    // //         tallies[i].textContent = parseInt(tallies[i].textContent) + parseInt(vote);
    // //     }
    // // },
    // // Update all numeric values on the page
    // _setAllValues: function (entry) {
    //     upvote._setValue(entry, 'tally', 'tally');
    //     upvote._setValue(entry, 'totalVotes', 'total-votes');
    //     upvote._setValue(entry, 'totalUpvotes', 'total-upvotes');
    //     upvote._setValue(entry, 'totalDownvotes', 'total-downvotes');
    // },
    // // Update the numeric value for a single element
    // _setValue: function (entry, key, classSuffix) {
    //     // Collect matching DOM elements
    //     group = "[data-id='"+entry['itemKey']+"']";
    //     results = document.querySelectorAll(group+".upvote-"+classSuffix);
    //     // Set value for all matching elements
    //     for (var el of results) {
    //         el.innerHTML = entry[key];
    //     }
    // },
    // // Generate combined item key
    // _setItemKey: function (elementId, key) {
    //     return elementId+(key ? '-'+key : '');
    // },
    // // Determine whether matching vote has already been cast
    // _determineMatch: function (icons) {
    //     if (!icons.length) {
    //         return false;
    //     } else {
    //         return ((' '+icons[0].className+' ').indexOf(' upvote-vote-match ') > -1);
    //     }
    // },
    // // Add vote match class to icons
    // _addMatchClass: function (icons) {
    //     for (var i = 0; i < icons.length; i++) {
    //         icons[i].className += ' upvote-vote-match';
    //     }
    // },
    // // Remove vote match class from icons
    // _removeMatchClass: function (icons) {
    //     for (var i = 0; i < icons.length; i++) {
    //         icons[i].className = icons[i].className.replace('upvote-vote-match', '');
    //     }
    // },
    // // Check whether a DOM element has specified class
    // _hasClass(element, className) {
    //     return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
    // }
};

// On page load, optionally preload Upvote data
addEventListener('load', function () {

    // Set up all maps on the page
    googleMapsPlugin.pageSetup();




    // Determine whether to preload data
    var checkPreloadSetting = function () {
        // // Initialize data with CSRF token
        // var data = JSON.parse(JSON.stringify(upvote.csrfToken));
        // // Remove vote
        // ajax
        //     .post(upvote.actionUrl+'google-maps/page/preload')
        //     .send(data)
        //     .end(function (err, res) {
        //         // If something went wrong, bail
        //         if (!res.ok) {
        //             console.log('Could not determine whether Upvote should be preloaded:', err);
        //             return;
        //         }
        //         // Get response data
        //         var data = res.body;
        //         // If setting is not enabled, bail (successfully)
        //         if (!data || !data.enabled) {
        //             return;
        //         }
        //         // Set up all Upvote elements on the page
        //         upvote.pageSetup();
        //     })
        // ;
    };
    // // If token already exists
    // if (upvote.csrfToken) {
    //     // Check whether to preload data using existing token
    //     checkPreloadSetting();
    // } else {
    //     // Check whether to preload data using a fresh token
    //     upvote.getCsrf(checkPreloadSetting);
    // }
});