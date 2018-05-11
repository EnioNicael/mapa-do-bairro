// dados locais
var locations = [
  {
    title: 'Itaipu Binacional',
    location: {
      lat: -25.446952,
      lng: -54.584818
    }
  },
  {
    title: 'Vale dos Dinossauros',
    location: {
      lat: -25.590745,
      lng: -54.518337}
  },
  {
    title: 'Dreamland Museu de Cera Foz do Iguaçu',
    location: {
      lat: -25.591244,
      lng: -54.516539}
  },
  {
    title: 'Parque das Aves',
    location: {
      lat: -25.613505,
      lng: -54.482524}
  },
  {
    title: 'Cataratas do Iguaçu',
    location: {
      lat: -25.691719,
      lng: -54.435274}
  }
];
// var markers = [];
var Location = function(data, marker) {
  this.name = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.marker = ko.observable(marker);
};

var ViewModel = function(locations, map){

  var self = this;
  // this.defaultIcon = self.makeMarkerIcon('0091ff');
  // self.highlightedIcon = self.makeMarkerIcon('FFFF24');

  self.largeInfowindow = ko.observable(new google.maps.InfoWindow());
  self.bounds = ko.observable(new google.maps.LatLngBounds());

  self.locationList = ko.observableArray([]); // lista dos locais
  self.locationMarkers = ko.observableArray([]); //  lista de marcadores dos locais
  self.visibleMarkers = ko.observableArray([]); // locais visiveis

  // popula o array com os marcadores dos locais
  for (var i = 0; i < locations.length; i++) {
    self.locationMarkers()[i] = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      map: map,
      animation: google.maps.Animation.DROP,
      // icon: self.defaultIcon,
      // id: i
    });

    self.bounds().extend(self.locationMarkers()[i].position);

    self.locationMarkers()[i].addListener('click', function() {
      self.populateInfoWindow(this, self.largeInfowindow());
    });

    // self.locationMarkers()[i].addListener('mouseover', function(){
    //   self.setIcon(self.highlightedIcon);
    // });
    // self.locationMarkers()[i].addListener('mouseout', function(){
    //   self.setIcon(self.defaultIcon);
    // });
  }

  map.fitBounds(self.bounds());

  // popula o array com a lista dos locais
  for (var i = 0; i < locations.length; i++) {
    self.locationList()[i] = new Location(locations[i], self.locationMarkers()[i]);
    // console.log('locationList: ' + self.locationList()[i].name());

    // self.locationList()[i].marker().addListener('click', function(){
    //   self.populateInfoWindow(self, largeInfowindow);
    // });
  }

  // locations.forEach(function(){
  //   self.locationList.push('Ola');
  // });

  // console.log('locationList: '+self.locationList()[0].location().lat);


  // for (var i = 0; i < locations.length; i++) {
  //   self.locationList()[i] = new Location(locations[i], self.locationMarkers()[i]);
  // }

  // self.showListings = function() {
    // var bounds = new google.maps.LatLngBounds();

    // for (var i = 0; i < self.locationList().length; i++) {
    //   self.locationList()[i].marker.setMap(map);
      // bounds.extend(self.locationList()[i].marker.position);
      // console.log('locationList: ' + self.locationList()[i].marker.title);
    // }

    // map.fitBounds(bounds);
  // };



  // eventos
  // self.makeMarkerIcon = function(markerColor) {
  //   var markerImage = new google.maps.MarkerImage(
  //     'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
  //     '|40|_|%E2%80%A2',
  //     new google.maps.Size(21, 34),
  //     new google.maps.Point(0, 0),
  //     new google.maps.Point(10, 34),
  //     new google.maps.Size(21,34));
  //   return markerImage;
  // };


  self.locationList().forEach(function(place){
    self.visibleMarkers.push(place);
  });
  // interage com o evento click da lista
  self.filterMarkers = function(){
    // var location = self.visibleMarkers.name;
    // visibleMarkers.forEach(function(mark){
    //
    // });
    // if (place.) {
    //
    // }
    // console.log('local capturado pelo evento: '+ location);
  //   console.log('click !');
  }
  // InfoWindow
  self.populateInfoWindow = function(marker, infowindow) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      // usar o setTimeout para tratamento de erros
      var wikiRequestTimeout = setTimeout(function(){
        infowindow.setContent('<div><p>Não foi possivel acessar dados do wikipedia!</p>,</div>');
      }, 8000);
      // faz uma requisiçao ajax na API do wikipedia
      $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response){
          var articleList = response[1];

          if ($.isEmptyObject(articleList)) {
            infowindow.setContent('A pesquisa não encontrou nenhum resultado.');
          }else {
            for(var i = 0; i < articleList.length; i++){
              articleStr = articleList[i];
              var url = 'https://en.wikipedia.org/wiki/' + articleStr;
              infowindow.setContent('<div>'+marker.title+'</div>'+
                                    '<div><ul><li><a href=" ' + url + '" target="_blank">' + articleStr +
                                    '</a></li></ul></div>');
            };
          }

          clearTimeout(wikiRequestTimeout);
        }
      });

      infowindow.open(map, marker);
      infowindow.addListener('closeclick', function(){
        infowindow.marker = null;
      });
    }
  };

  // self.filterMarkers = function() {
  //   if (true) {
  //
  //   }
  // };
}

var initMap = function(){
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:  -25.516336, lng: -54.585376},
    zoom: 15
  });

  ko.applyBindings(new ViewModel(locations, map));
};
