// array de marcadores
var markers = [];
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
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.marker = ko.observable(marker);
};
// Personaliza os marcadores
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
// Manipula animação dos marcadores
function toggleBounce(marker) {
  setTimeout(function(){marker.setAnimation(google.maps.Animation.BOUNCE)},1000);
  setTimeout(function(){marker.setAnimation(null)}, 3000);
}
// Popula o infoWindow
function populateInfoWindow(marker, infowindow) {
  // Url da busca
  var wikiUrl = 'https://wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
  if (infowindow.marker != marker) {
    infowindow.setContent('');
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
            var url = 'https://pt.wikipedia.org/wiki/' + articleStr;
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

var ViewModel = function(map, infoWindow, defaultIcon, customIcon){
  var self = this;
  // Arrays de lista e marcadores
  self.locationList = ko.observableArray([]);
  self.filterList = ko.observableArray([]);
  // Entrada do filtro
  self.query = ko.observable('');
  // preenche o array com os dados e marcadores
  for (var i = 0; i < markers.length; i++) {
    self.locationList()[i] = new Location(locations[i], markers[i]);
    // Eventos dos marcadores
    self.locationList()[i].marker().addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    });
    self.locationList()[i].marker().addListener('click', function() {
      toggleBounce(this);
    });
    self.locationList()[i].marker().addListener('mouseover', function() {
      this.setIcon(customIcon);
    });
    self.locationList()[i].marker().addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  // Pega a entrada do input
  self.getFilter = function(input) {
    return ko.utils.arrayFilter(self.locationList(), function(location) {
        return location.title().toLowerCase().indexOf(input) >= 0;
    });
  }
  // Filtra a lista de acordo com a entrada de busca
  self.filter = ko.computed(function() {
      var search = self.query().toLowerCase();
      var filter = self.getFilter(search);
      self.filterList(filter);
      return self.filterList();
  }, this);
  // Atualiza o mapa de acordo com o filtro
  self.showListings = function() {
    for (var i = 0; i < self.locationList().length; i++) { // Esconde os marcadores
      self.locationList()[i].marker().setMap(null);
    }
    for (var i = 0; i < self.locationList().length; i++) { // Mostra no mapa somente os marcadores do filtro
      for (var j = 0; j < self.filterList().length; j++) {
        if (self.locationList()[i].title() == self.filterList()[j].title()) {
          self.locationList()[i].marker().setMap(map);
        }
      }
    }
  };
  // Manipula os eventos do menu dropdown
  self.markerEvents = function(place) {
    toggleBounce(place.marker());
    place.marker().setIcon(customIcon);
  };

  self.MarkerMouseout = function(place) {
    place.marker().setIcon(defaultIcon);
  };
  // Popula o infoWindow atraves do menu dropdown
  self.searchInfo = function(place) {
    populateInfoWindow(place.marker(), infoWindow);
  }
}
// Inicia o mapa
var initMap = function(){
  // Recursos do Maps
  var infoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // Pesonaliza os marcadores
  var defaultIcon = makeMarkerIcon('f44336');
  var customIcon = makeMarkerIcon('4caf50');

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:  -25.516336, lng: -54.585376},
    zoom: 15
  });
  // Popula o array marker com os marcadores
  locations.forEach(function(location) {
      var marker = new google.maps.Marker({
        position: location.location,
        title: location.title,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
      });

      bounds.extend(marker.position);

      markers.push(marker);
  });

  map.fitBounds(bounds);

  ko.applyBindings(new ViewModel(map, infoWindow, defaultIcon, customIcon));
};
// Tratamento de erro do Google Maps
var googleError = function() {
  alert('Erro ao carregar o Google Maps!');
};
