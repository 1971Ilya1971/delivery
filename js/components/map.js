const TILES_URL = `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`;
const markerIcon = `img/pin-current.png`;

export default class Map {
  /* eslint-disable */
  constructor() {
    this._map = L.map(`mapid`);
    this._marker = L.icon({
      iconUrl: markerIcon,
      iconSize: [28, 44],
      iconAnchor: [14, 35]
    });
  }

  setMarker(latLng) {
    L.marker(latLng, {icon: this._marker}).addTo(this._map);
  }

  updateMapView(latLng, zoom = 18) {
    this._map.flyTo(latLng, zoom, {duration: 2});
  }

  init(latLng = [61.5240, 75.317420]) {
    L.tileLayer(TILES_URL, {
      minZoom: 1,
      maxZoom: 19,
      detectRetina: true
    }).addTo(this._map);

    this._map.setView(latLng, 3);
  }
  /* eslint-enable */
}
