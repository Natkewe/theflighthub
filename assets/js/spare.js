
    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/handlebars/4.7.7/handlebars.min.js"></script>
    
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
   


    <script>
      'use strict';

      /** Helper function to generate a Google Maps directions URL */
      function generateDirectionsURL(origin, destination) {
        const googleMapsUrlBase = 'https://www.google.com/maps/dir/?';
        const searchParams = new URLSearchParams('api=1');
        searchParams.append('origin', origin);
        const destinationParam = [];
        // Add title to destinationParam except in cases where Quick Builder set
        // the title to the first line of the address
        if (destination.title !== destination.address1) {
          destinationParam.push(destination.title);
        }
        destinationParam.push(destination.address1, destination.address2);
        searchParams.append('destination', destinationParam.join(','));
        return googleMapsUrlBase + searchParams.toString();
      }

      /**
       * Defines an instance of the Locator+ solution, to be instantiated
       * when the Maps library is loaded.
       */
      function LocatorPlus(configuration) {
        const locator = this;

        locator.locations = configuration.locations || [];
        locator.capabilities = configuration.capabilities || {};

        const mapEl = document.getElementById('gmp-map');
        const panelEl = document.getElementById('locations-panel');
        locator.panelListEl = document.getElementById('locations-panel-list');
        const sectionNameEl =
            document.getElementById('location-results-section-name');
        const resultsContainerEl = document.getElementById('location-results-list');

        const itemsTemplate = Handlebars.compile(
            document.getElementById('locator-result-items-tmpl').innerHTML);

        locator.searchLocation = null;
        locator.searchLocationMarker = null;
        locator.selectedLocationIdx = null;
        locator.userCountry = null;

        // Initialize the map -------------------------------------------------------
        locator.map = new google.maps.Map(mapEl, configuration.mapOptions);

        // Store selection.
        const selectResultItem = function(locationIdx, panToMarker, scrollToResult) {
          locator.selectedLocationIdx = locationIdx;
          for (let locationElem of resultsContainerEl.children) {
            locationElem.classList.remove('selected');
            if (getResultIndex(locationElem) === locator.selectedLocationIdx) {
              locationElem.classList.add('selected');
              if (scrollToResult) {
                panelEl.scrollTop = locationElem.offsetTop;
              }
            }
          }
          if (panToMarker && (locationIdx != null)) {
            locator.map.panTo(locator.locations[locationIdx].coords);
          }
        };

        // Create a marker for each location.
        const markers = locator.locations.map(function(location, index) {
          const marker = new google.maps.Marker({
            position: location.coords,
            map: locator.map,
            title: location.title,
          });
          marker.addListener('click', function() {
            selectResultItem(index, false, true);
          });
          return marker;
        });

        // Fit map to marker bounds.
        locator.updateBounds = function() {
          const bounds = new google.maps.LatLngBounds();
          if (locator.searchLocationMarker) {
            bounds.extend(locator.searchLocationMarker.getPosition());
          }
          for (let i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].getPosition());
          }
          locator.map.fitBounds(bounds);
        };
        if (locator.locations.length) {
          locator.updateBounds();
        }

        // Get the distance of a store location to the user's location,
        // used in sorting the list.
        const getLocationDistance = function(location) {
          if (!locator.searchLocation) return null;

          // Fall back to straight-line distance.
          return google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(location.coords),
              locator.searchLocation.location);
        };

        // Render the results list --------------------------------------------------
        const getResultIndex = function(elem) {
          return parseInt(elem.getAttribute('data-location-index'));
        };

        locator.renderResultsList = function() {
          let locations = locator.locations.slice();
          for (let i = 0; i < locations.length; i++) {
            locations[i].index = i;
          }
          if (locator.searchLocation) {
            sectionNameEl.textContent =
                'Nearest locations (' + locations.length + ')';
            locations.sort(function(a, b) {
              return getLocationDistance(a) - getLocationDistance(b);
            });
          } else {
            sectionNameEl.textContent = `All locations (${locations.length})`;
          }
          const resultItemContext = {locations: locations};
          resultsContainerEl.innerHTML = itemsTemplate(resultItemContext);
          for (let item of resultsContainerEl.children) {
            const resultIndex = getResultIndex(item);
            if (resultIndex === locator.selectedLocationIdx) {
              item.classList.add('selected');
            }

            const resultSelectionHandler = function() {
              if (resultIndex !== locator.selectedLocationIdx) {
                selectResultItem(resultIndex, true, false);
              }
            };

            // Clicking anywhere on the item selects this location.
            // Additionally, create a button element to make this behavior
            // accessible under tab navigation.
            item.addEventListener('click', resultSelectionHandler);
            item.querySelector('.select-location')
                .addEventListener('click', function(e) {
                  resultSelectionHandler();
                  e.stopPropagation();
                });

            // Clicking the directions button will open Google Maps directions in a
            // new tab
            const origin = (locator.searchLocation != null) ?
                locator.searchLocation.location :
                '';
            const destination = locator.locations[resultIndex];
            const googleMapsUrl = generateDirectionsURL(origin, destination);
            item.querySelector('.directions-button')
                .setAttribute('href', googleMapsUrl);
          }
        };

        // Optional capability initialization --------------------------------------
        initializeSearchInput(locator);

        // Initial render of results -----------------------------------------------
        locator.renderResultsList();
      }

      /** When the search input capability is enabled, initialize it. */
      function initializeSearchInput(locator) {
        const geocodeCache = new Map();
        const geocoder = new google.maps.Geocoder();

        const searchInputEl = document.getElementById('location-search-input');
        const searchButtonEl = document.getElementById('location-search-button');

        const updateSearchLocation = function(address, location) {
          if (locator.searchLocationMarker) {
            locator.searchLocationMarker.setMap(null);
          }
          if (!location) {
            locator.searchLocation = null;
            return;
          }
          locator.searchLocation = {'address': address, 'location': location};
          locator.searchLocationMarker = new google.maps.Marker({
            position: location,
            map: locator.map,
            title: 'My location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#3367D6',
              fillOpacity: 0.5,
              strokeOpacity: 0,
            }
          });

          // Update the locator's idea of the user's country, used for units. Use
          // `formatted_address` instead of the more structured `address_components`
          // to avoid an additional billed call.
          const addressParts = address.split(' ');
          locator.userCountry = addressParts[addressParts.length - 1];

          // Update map bounds to include the new location marker.
          locator.updateBounds();

          // Update the result list so we can sort it by proximity.
          locator.renderResultsList();
        };

        const geocodeSearch = function(query) {
          if (!query) {
            return;
          }

          const handleResult = function(geocodeResult) {
            searchInputEl.value = geocodeResult.formatted_address;
            updateSearchLocation(
                geocodeResult.formatted_address, geocodeResult.geometry.location);
          };

          if (geocodeCache.has(query)) {
            handleResult(geocodeCache.get(query));
            return;
          }
          const request = {address: query, bounds: locator.map.getBounds()};
          geocoder.geocode(request, function(results, status) {
            if (status === 'OK') {
              if (results.length > 0) {
                const result = results[0];
                geocodeCache.set(query, result);
                handleResult(result);
              }
            }
          });
        };

        // Set up geocoding on the search input.
        searchButtonEl.addEventListener('click', function() {
          geocodeSearch(searchInputEl.value.trim());
        });

        // Add in an event listener for the Enter key.
        searchInputEl.addEventListener('keypress', function(evt) {
          if (evt.key === 'Enter') {
            geocodeSearch(searchInputEl.value);
          }
        });
      }
    </script>
    <script>
      const CONFIGURATION = {
        "locations": [
          {"title":"Manchester","address1":"Manchester","address2":"UK","coords":{"lat":53.48131296542883,"lng":-2.2422925416641326},"placeId":"ChIJ2_UmUkxNekgRqmv-BDgUvtk"}
        ],
        "mapOptions": {"center":{"lat":38.0,"lng":-100.0},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":false,"zoom":4,"zoomControl":true,"maxZoom":17,"mapId":""},
        "mapsApiKey": "AIzaSyAwLlz5qT-GEkIPON7uFnrBaamDLMKYZQo",
        "capabilities": {"input":true,"autocomplete":false,"directions":false,"distanceMatrix":false,"details":false,"actions":false}
      };


function initMap() {
        new LocatorPlus(CONFIGURATION);
      }
  
    <script id="locator-result-items-tmpl" type="text/x-handlebars-template">
      {{#each locations}}
        <li class="location-result" data-location-index="{{index}}">
          <button class="select-location">
            <h2 class="name">{{title}}</h2>
          </button>
          <div class="address">{{address1}}<br>{{address2}}</div>
          <a class="directions-button" href="" target="_blank" title="Get directions to this location on Google Maps">
            <svg width="34" height="34" viewBox="0 0 34 34"
                  fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5867 9.24375L17.9403 8.8902V8.8902L17.5867 9.24375ZM16.4117 9.24375L16.7653 9.59731L16.7675 9.59502L16.4117 9.24375ZM8.91172 16.7437L8.55817 16.3902L8.91172 16.7437ZM8.91172 17.9229L8.55817 18.2765L8.55826 18.2766L8.91172 17.9229ZM16.4117 25.4187H16.9117V25.2116L16.7652 25.0651L16.4117 25.4187ZM16.4117 25.4229H15.9117V25.63L16.0582 25.7765L16.4117 25.4229ZM25.0909 17.9229L25.4444 18.2765L25.4467 18.2742L25.0909 17.9229ZM25.4403 16.3902L17.9403 8.8902L17.2332 9.5973L24.7332 17.0973L25.4403 16.3902ZM17.9403 8.8902C17.4213 8.3712 16.5737 8.3679 16.0559 8.89248L16.7675 9.59502C16.8914 9.4696 17.1022 9.4663 17.2332 9.5973L17.9403 8.8902ZM16.0582 8.8902L8.55817 16.3902L9.26527 17.0973L16.7653 9.5973L16.0582 8.8902ZM8.55817 16.3902C8.0379 16.9105 8.0379 17.7562 8.55817 18.2765L9.26527 17.5694C9.13553 17.4396 9.13553 17.227 9.26527 17.0973L8.55817 16.3902ZM8.55826 18.2766L16.0583 25.7724L16.7652 25.0651L9.26517 17.5693L8.55826 18.2766ZM15.9117 25.4187V25.4229H16.9117V25.4187H15.9117ZM16.0582 25.7765C16.5784 26.2967 17.4242 26.2967 17.9444 25.7765L17.2373 25.0694C17.1076 25.1991 16.895 25.1991 16.7653 25.0694L16.0582 25.7765ZM17.9444 25.7765L25.4444 18.2765L24.7373 17.5694L17.2373 25.0694L17.9444 25.7765ZM25.4467 18.2742C25.9631 17.7512 25.9663 16.9096 25.438 16.3879L24.7354 17.0995C24.8655 17.2279 24.8687 17.4363 24.7351 17.5716L25.4467 18.2742Z" fill="#1967d2"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19 19.8333V17.75H15.6667V20.25H14V16.9167C14 16.4542 14.3708 16.0833 14.8333 16.0833H19V14L21.9167 16.9167L19 19.8333Z" fill="#1967d2"/>
              <circle class="directions-button-background" cx="17" cy="17" r="16.5" stroke="#1967d2"/>
            </svg>
          </a>
        </li>
      {{/each}}
    </script>