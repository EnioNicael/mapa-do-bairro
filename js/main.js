// dados locais

var locations = [
  {
    title: 'EM Francisco Meireles',
    location: {
      lat: -22.197116,
      lng: -54.787947
    }
  },
  {
    title: 'Hospital da Missâo',
    location: {
      lat: -22.195912,
      lng: -54.788572}
  },
  {
    title: 'Posto de saúde',
    location: {
      lat: -22.183608,
      lng: -54.797779}
  },
  {
    title: 'EMI Ramão Martins',
    location: {
      lat: -22.17732,
      lng: -54.807836}
  },
  {
    title: 'EMI Tengatui Marangatu',
    location: {
      lat: -22.174244,
      lng: -54.828739}
  },
  {
    title: 'EE Marçal de Souza',
    location: {
      lat: -22.174482,
      lng: -54.829439}
  },
  {
    title: 'Posto de saúde',
    location: {
      lat: -22.174183,
      lng: -54.829023}
    },
  {
    title: 'Vila Olimpica',
    location: {
      lat: -22.169899,
      lng: -54.837355}
    }
];

// var markers = [];

var Location = function(data, marker) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.marker = marker;
};

var ViewModel = function(locations, map){

  // this.defaultIcon = this.makeMarkerIcon('0091ff');
  // this.highlightedIcon = this.makeMarkerIcon('FFFF24');
  this.largeInfowindow = new google.maps.InfoWindow();

  this.locationList = ko.observableArray([]); // lista dos locais
  this.locationMarkers = ko.observableArray([]); // lista de marcadores dos locais

  // popula o array com os marcadores dos locais
  for (var i = 0; i < locations.length; i++) {
    this.locationMarkers()[i] = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: this.defaultIcon,
      id: i
    });
    // color
    this.locationMarkers()[i].addListener('mouseover', function() {
      this.setIcon(this.highlightedIcon);
    });
    this.locationMarkers()[i].addListener('mouseout', function() {
      this.setIcon(this.defaultIcon);
    });
    // infowindow
    this.locationMarkers()[i].addListener('click', function(){
      populateInfoWindow(this, largeInfowindow);
    });
  }
  // popula o array com a lista dos locais
  for (var i = 0; i < locations.length; i++) {
    this.locationList()[i] = new Location(locations[i], this.locationMarkers()[i]);
  }

  this.showListings = function() {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < this.locationList().length; i++) {
      this.locationList()[i].marker.setMap(map);
      bounds.extend(this.locationList()[i].marker.position);
      console.log('locationList: ' + this.locationList()[i].marker.title);
    }

    map.fitBounds(bounds);
  };

  // eventos
  this.makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  };

  // InfoWindow
  this.populateInfoWindow = function(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>'+marker.title+'</div>');
      infowindow.open(map, marker);
      infowindow.addListener('closeclick', function(){
        infowindow.marker = null;
      });
    }
  };

  this.filterMarkers = function() {
    if (true) {

    }
  };
}

var initMap = function(){
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -22.177092, lng: -54.808242},
    // center: {lat: -21.128627, lng: -56.492892},
    zoom: 15
  });


  ko.applyBindings(new ViewModel(locations, map));
};
