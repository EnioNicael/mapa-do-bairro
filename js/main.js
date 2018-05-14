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
    title: 'Marco das Três Fronteiras',
    location: {
      lat: -25.589528,
      lng: -54.590074}
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

var Location = function(data, marker) {
  this.name = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.marker = ko.observable(marker);
};

var ViewModel = function(locations, map){
  var self = this;
  // Altera as cores dos marcadores
  self.defaultIcon = makeMarkerIcon('f44336');
  self.customIcon = makeMarkerIcon('4caf50');
  // Recursos do Maps
  self.largeInfowindow = ko.observable(new google.maps.InfoWindow());
  self.bounds = ko.observable(new google.maps.LatLngBounds());
  // Arrays de lista e marcadores
  self.locationList = ko.observableArray([]);
  self.locationMarkers = ko.observableArray([]);
  // Popula o array com os marcadores
  for (var i = 0; i < locations.length; i++) {
    self.locationMarkers()[i] = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: self.defaultIcon,
      id: i
    });

    self.bounds().extend(self.locationMarkers()[i].position);
    // Eventos
    self.locationMarkers()[i].addListener('click', function() {
      self.populateInfoWindow(this, self.largeInfowindow());
    });
    self.locationMarkers()[i].addListener('mouseover', function(){
      this.setIcon(self.customIcon);
    });
    self.locationMarkers()[i].addListener('mouseout', function(){
      this.setIcon(self.defaultIcon);
    });
  }

  map.fitBounds(self.bounds());
  // Popula o array com a lista dos locais
  for (var i = 0; i < locations.length; i++) {
    self.locationList()[i] = new Location(locations[i], self.locationMarkers()[i]);
  }
  // Manipula as cores dos marcadores
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }
  // Vinculado ao evento de click da lista na view
  self.filterMarkers = function(place){
    self.populateInfoWindow(place.marker(), self.largeInfowindow());
  };
  // Manipula as Informações
  self.populateInfoWindow = function(marker, infowindow) {
    // Url da busca
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      // Usa o setTimeout para tratamento de erros
      var wikiRequestTimeout = setTimeout(function(){
        infowindow.setContent('<div><p>Não foi possivel acessar dados do wikipedia!</p>,</div>');
      }, 8000);
      // faz uma requisiçao ajax na API do wikipedia
      $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response){
          var articleList = response[1];
          // Resultado da busca
          if ($.isEmptyObject(articleList)) {
            infowindow.setContent('A pesquisa não encontrou nenhum resultado.');
          }else {
            for(var i = 0; i < articleList.length; i++){
              var articleStr = articleList[i];
              var url = 'https://en.wikipedia.org/wiki/' + articleStr;
              infowindow.setContent('<div>'+marker.title+'</div>'+'<div><ul><li><a href=" ' +
                                    url + '" target="_blank">' + articleStr + '</a></li></ul></div>');
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
}
// Inicia o mapa
var initMap = function(){
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:  -25.516336, lng: -54.585376},
    zoom: 15
  });

  ko.applyBindings(new ViewModel(locations, map));
};
