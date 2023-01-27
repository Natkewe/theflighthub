
  
  function myFunction() {
    var txt;
    if (confirm("Press a button!")) {
      txt = "You pressed OK!";
    } else {
      txt = "You pressed Cancel!";
    }
    document.getElementById("demo").innerHTML = txt;
  }
  



/* Code taken from both Code Institute
* https://learn.codeinstitute.net/courses/course-v1:CodeInstitute+IFD101+2017_T3/courseware/03d3f6524ad249d9b33e3336d156dfd0/3b2af8636ea54a4d9dc45126f7498633/
* and from Google Maps API Platform  


  function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: {
            lat: 53.378273,
            lng: -1.479677
        }
    });

    // creates letters for markers for on the map
    var labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // creates location points to put markers on the map (creates an array with an object)
    var locations = [
      { lat: 53.378273, lng: -1.479677 },
      { lat: 51.482717, lng: -3.173433 },
    ];

    // iterate through that array and create a new marker that has the label from our string 
    //returns an array which loops through all our items in the locations array
    var markers = locations.map(function(location, i) {
        return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
        });
    });

    var markerCluster = new MarkerClusterer(map, markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
}

*/