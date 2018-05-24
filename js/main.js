// Array de marcadores
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
    title: 'Parque dos Peixes',
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

  // Arrays de lista e marcadores
  self.locationList = ko.observableArray([]);
  // Entrada do filtro
  self.query = ko.observable('');
  // Variaveis para tratamento das Informações
  self.title = ko.observable();
  self.wikiUrl = ko.observable();
  self.article = ko.observable();
  self.errorMessage = ko.observable();
  self.wikiRequestTimeout = ko.observable();
  // Popula o array com a lista dos locais
  for (var i = 0; i < locations.length; i++) {
    self.locationList()[i] = new Location(locations[i], markers[i]);
  }
  // Filtra a lista
  self.filter = ko.computed(function() {
      var search = self.query().toLowerCase();
      return ko.utils.arrayFilter(self.locationList(), function(location) {
          return location.name().toLowerCase().indexOf(search) >= 0;
      });
  }, this);
  // Trata as Informações sobre o local
  self.filterMarkers = function(place) {
    self.title(place.name());
    self.wikiUrl('https://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.title() + '&format=json&callback=wikiCallback')
    // Focaliza no marcador filtrado
    var bounds = new google.maps.LatLngBounds();
    place.marker().setMap(map);
    bounds.extend(place.marker().position);
    map.fitBounds(bounds);
    // Tratamento de erro
    self.wikiRequestTimeout(setTimeout(function(){
      self.errorMessage('Failed to get wikipedia resources!');
    }, 8000));
    // faz uma requisiçao ajax na API do wikipedia
    $.ajax({
      url: self.wikiUrl(),
      dataType: "jsonp",
      success: function(response){
        var articleList = response[1];
        if ($.isEmptyObject(articleList)) {
          self.article('<li><p>A pesquisa não encontrou nenhum resultado!</p></li>');
        }else {
          for(var i = 0; i < articleList.length; i++){
            var articleStr = articleList[i];
            var url = 'https://en.wikipedia.org/wiki/' + articleStr;
            self.article('<li><a target="_blank" href="' + url + '">' + articleStr + '</a></li>');
          };
        }
        clearTimeout(self.wikiRequestTimeout());
      }
    });
  }
  // Mostra a lista toda
  self.showListings = function() {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < self.locationList().length; i++) {
      self.locationList()[i].marker().setMap(map);
      bounds.extend(self.locationList()[i].marker().position);
    }

    map.fitBounds(bounds);
  };

  // teste();
}
// Inicia o mapa
var initMap = function(){
  // Recursos do Maps
  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // Pesonaliza os marcadores
  var defaultIcon = makeMarkerIcon('img/red.png');
  var customIcon = makeMarkerIcon('img/blue.png');

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:  -25.516336, lng: -54.585376},
    zoom: 15
  });

  var viewModel = new ViewModel(locations, map);
  ko.applyBindings(viewModel);

  for (var i = 0; i < locations.length; i++) {
    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon
    });
    // Alimenta o array com marcadores
    markers.push(marker);

    bounds.extend(marker.position);
    // Eventos
    marker.addListener('click', function(){
      viewModel.filterMarkers();
      // populateInfoWindow(this, largeInfowindow);
    });
    marker.addListener('mouseover', function(){
      this.setIcon(customIcon);
    });
    marker.addListener('mouseout', function(){
      this.setIcon(defaultIcon);
    });
  }

  map.fitBounds(bounds);
  // Manipula as cores dos marcadores
  function makeMarkerIcon(img) {
    var markerImage = new google.maps.MarkerImage(img);
    return markerImage;
  };

  // function showListings() {
  //   var bounds = new google.maps.LatLngBounds();
  //   // Extend the boundaries of the map for each marker and display the marker
  //   for (var i = 0; i < markers.length; i++) {
  //     markers[i].setMap(map);
  //     bounds.extend(markers[i].position);
  //   }
  //   map.fitBounds(bounds);
  // }

  // var populateInfoWindow = function(marker, infowindow) {
  //   // Url da busca
  //   var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
  //   if (infowindow.marker != marker) {
  //     infowindow.marker = marker;
  //     // Usa o setTimeout para tratamento de erros
  //     var wikiRequestTimeout = setTimeout(function(){
  //       infowindow.setContent('<div><p>Não foi possivel acessar dados do wikipedia!</p>,</div>');
  //     }, 8000);
  //     // faz uma requisiçao ajax na API do wikipedia
  //     $.ajax({
  //       url: wikiUrl,
  //       dataType: "jsonp",
  //       success: function(response){
  //         var articleList = response[1];
  //         // Resultado da busca
  //         if ($.isEmptyObject(articleList)) {
  //           infowindow.setContent('A pesquisa não encontrou nenhum resultado.');
  //         }else {
  //           for(var i = 0; i < articleList.length; i++){
  //             var articleStr = articleList[i];
  //             var url = 'https://en.wikipedia.org/wiki/' + articleStr;
  //             infowindow.setContent('<div>'+marker.title+'</div>'+'<div><ul><li><a href=" ' +
  //                                   url + '" target="_blank">' + articleStr + '</a></li></ul></div>');
  //           };
  //         }
  //         clearTimeout(wikiRequestTimeout);
  //         }
  //     });
  //     infowindow.open(map, marker);
  //     infowindow.addListener('closeclick', function(){
  //       infowindow.marker = null;
  //     });
  //   }
  // };

  var teste = function(){
    console.log('click');
  }

  // ko.applyBindings(viewModel);

};
// Tratamento de erro do Google Maps
var googleError = function() {
  alert('Erro ao carregar o Google Maps!');
};
