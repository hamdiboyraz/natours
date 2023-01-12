import 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js';

const token =
  'pk.eyJ1IjoiZGV2bmV3IiwiYSI6ImNsY2hscmJiMTAwZHEzcG10eTQyZWh5ZGUifQ.Q40KWuTaIJIpvMb7fCcLBw';

const displayMap = (locations) => {
  // Display map on page with mapbox
  mapboxgl.accessToken = token;
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/devnew/clchnzcit008f14qi1jx5t318',
    //   center: [-118.113491, 34.111745],
    //   zoom: 5,
    scrollZoom: false,
  });

  // Define bounds for map to fit
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker to map
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', // bottom of the marker
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30, // offset from the marker preventing popup from covering the marker
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  // Fit map to bounds, automatically zooming in and out
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-right');
};

// DOM elements
const mapBox = document.getElementById('map');

if (mapBox) {
  // get locations from map element
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}
