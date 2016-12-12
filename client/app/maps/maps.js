var map = angular.module('app.map', []);

map.controller('MapController', function($scope, Geocoder) {
  $scope.queryLoc;
  $scope.markers = [];

  //Add marker to map based on lat and lng
  var addMarker = function(lat, lng, imageUrl) {
    var marker = new google.maps.Marker({
      position: {lat: lat, lng: lng},
      map: $scope.map,
    });

    marker.index = $scope.markers.length;

    imageUrl = imageUrl.slice(0, -4);

    imageUrl += 'm.jpg';

    console.log(imageUrl);

    marker.infoWindow = new google.maps.InfoWindow({
      content: '<img class="hover" src=' + imageUrl + '>'
    });

    marker.addListener('mouseover', function() {
      marker.infoWindow.open(map, marker);
    });

    marker.addListener('mouseout', function() {
      marker.infoWindow.close();
    });

    marker.addListener('click', function() {
      marker.setMap(null);
      $scope.markers.splice(marker.index);
    });

    $scope.markers.push(marker);

    //If more than 3 markers are placed, redraw map based on the bounds of those markers
    if ($scope.markers.length > 3) {
      $scope.map.bounds = new google.maps.LatLngBounds();
      $scope.markers.forEach(function(marker) {
        $scope.map.bounds.extend(marker.getPosition());
      });
      $scope.setMapBounds($scope.map.bounds);
      console.log('scope.map.bounds', $scope.map.bounds);
    }

  };

  $scope.generateMap = function(queryLoc) {
    $scope.markers = [];
    Geocoder.getLatLng(queryLoc, $scope.drawMap);
    Geocoder.getBounds(queryLoc, $scope.setMapBounds);
  };

  $scope.$on('search', function(e) {
    $scope.generateMap($scope.$parent.searchQuery);
  });

  $scope.$on('picClick', function(e) {
    addMarker($scope.$parent.lat, $scope.$parent.lng, $scope.$parent.imageUrl);
  });

});

//angular directive tied to the my-map element in index.html.  This replaces my-map with the DOM elments generated by the template and modifoed by the link function
map.directive('myMap', function(Geocoder) {

  var link = function(scope, element, attrs) {

    //Saves map dom element into
    scope.mapElement = element[0];


    //Attempts to set bounds of scope.map, useful for scaling map based on size of desired area
    scope.setMapBounds = function(bounds) {
      if (bounds !== undefined) {
        scope.map.fitBounds(bounds);
        scope.map.bounds = bounds;
      }
    };


    //Saves function to scope to draw a new map based on lat & lng, this function is available in the shared scope as $scope
    scope.drawMap = function(lat, lng, zoom = 13) {

      var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: zoom,
        scrollwheel: false,
        show: true
      };

      // Use mapOptions object to create a new map and save to scope.map
      scope.map = new google.maps.Map(scope.mapElement, mapOptions);

      //Creat map bounds property
      scope.map.bounds = new google.maps.LatLngBounds();

      // Add click event listener, which call the $scope.click method
      google.maps.event.addListener(scope.map, 'click', function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        scope.clickMap(lat, lng);
      }); //end addListener

    };

  };

  return {
    template: ' <div id="map_canvas" ng-controller="MapController"><div id="gmap"></div></div>',
    replace: true,
    //function passed into link will modify the elements that the directive adds to the dom
    link: link,
    //setting scope to false will allow scope to be shared with the controller
    scope: false
  };
});
