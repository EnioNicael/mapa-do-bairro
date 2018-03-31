// dados locais
// var markers = [];

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

var markers = [];

var Location = function(data, marker) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.marker = marker;
};

var ViewModel = function(locations, map){

  this.bounds = new google.maps.LatLngBounds();
  this.locationList = ko.observableArray([]);
  this.locationMarkers = ko.observableArray([]);


  for (var i = 0; i < locations.length; i++) {
    this.locationMarkers()[i] = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      map: map
    });
  }

  this.bounds.extend(ma)

  this.showListings = function() {
    for (var i = 0; i < this.locationList().length; i++) {
      this.locationList()[i].marker.setMap(map);
      console.log('locationList: ' + this.locationList()[i].marker.title);
    }
  };

  // this.locationList().forEach(function(mark){
  //   mark.marker.setMap(map);
  //   // console.log('forEach: ' + mark.location);
  // });



}

var initMap = function(){
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -22.177092, lng: -54.808242},
    // center: {lat: -21.128627, lng: -56.492892},
    zoom: 15
  });


  ko.applyBindings(new ViewModel(locations, map));
};
