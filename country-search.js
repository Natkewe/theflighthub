

L.mapquest.key = 'lyuVV7BAllZ7Z8zc6R759eWuPqcJZlEP';
let map = L.mapquest.map('map', {
  center: [40.7128, -74.0059],
  layers: L.mapquest.tileLayer('map'),
  zoom: 14,
  zoomControl: false
});

let searchControl = L.mapquest.searchControl({
  className: '',
  hoverMarker: {
    icon: 'marker',
    iconOptions: {
      size: 'sm',
      primaryColor: '#333333',
      secondaryColor: '#333333'
    }
  },
  search: {
    sort: 'relevance',
    pageSize: 20
  },
  searchInput: {
    searchAheadOptions: {
      limit: 6,
      collection: 'address,adminArea,airport,poi,category,franchise'
    },
    compactResults: true,
    placeholderText: 'Search',
    clearTitle: 'Clear search'
  },
  searchLayer: {
    buffer: 256,
    collisionMargin: 2,
    marker: {
      icon: 'via',
      iconOptions: {
        primaryColor: '#ffffff',
        secondaryColor: '#333333',
        size: 'lg'
      },
      popupEnabled: true
    },
    paddingTopLeft: [420, 20],
    paddingBottomRight: [20, 20],
    searchResponse: {},
    updateResultsOnMapMove: true
  }
}).addTo(map);

