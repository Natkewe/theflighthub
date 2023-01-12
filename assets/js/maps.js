
// Map for store finder

/* Code taken from both Code Institute 
https://learn.codeinstitute.net/courses/course-v1:CodeInstitute+IFD101+2017_T3/courseware/03d3f6524ad249d9b33e3336d156dfd0/3b2af8636ea54a4d9dc45126f7498633/
and from Google Maps API Platform
*/
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 3,
      center: { 
        lat: 53.378273, 
        lng: -1.479677 
    },
    });
    
    // Create an array of alphabetical characters used to label the markers.
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // Add some markers to the map.
    const markers = locations.map(function(location, i) {
        return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
        });
    });
  
    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
}
  
  const locations = [
    { lat: 53.378273, lng: -1.479677 },
    { lat: 51.482717, lng: -3.173433 },
    { lat: 52.486309, lng: -1.905444 },
    { lat: 52.405048, lng: -1.523545 },
    { lat: 51.652295, lng: -0.412294 },
  ];
  

