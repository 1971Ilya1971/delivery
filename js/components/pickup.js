import {setElementAttrs} from '../helpers.js';
import {API_URL} from '../constants.js';

export default class Pickup {
  constructor(map) {
    this._allCities = [];
    this._map = map;
  }

  _getAllCities() {
    return new Promise((resolve) =>
      fetch(`${API_URL}/cities`)
        .then((res) => res.json())
        .then((data) => {
          this._allCities = data;
          resolve();
        })
    );
  }

  _renderAddresses() {
    const citiesListEl = document.querySelector(`.js_cities-list`);
    const addressesEl = document.querySelector(`.js_addresses`);

    this._allCities.forEach((city) => {
      const addressEl = document.createElement(`div`);
      const cityInputEl = document.createElement(`input`);
      const cityLabelEl = document.createElement(`label`);
      const pickUpCityId = `pick-up-${city['city-id']}`;

      setElementAttrs(cityInputEl, {
        id: pickUpCityId,
        type: `radio`,
        name: `city`,
        fieldType: `pickup`,
        value: city['city-id']
      });

      setElementAttrs(cityLabelEl, {
        htmlFor: pickUpCityId,
        innerHTML: city.city
      });

      citiesListEl.append(cityInputEl);
      citiesListEl.append(cityLabelEl);

      city[`delivery-points`].forEach((point, index) => {
        const {coordinates, address} = point;
        const pointInputEl = document.createElement(`input`);
        const pointLabelEl = document.createElement(`label`);
        const pointId = `${pickUpCityId}-address-${index + 1}`;

        addressEl.classList.add(
            `input-wrapper--radio-group`,
            `js_address`,
            `hidden`
        );
        addressEl.dataset.cityId = pickUpCityId;

        pointInputEl.dataset.coordinates = coordinates;

        setElementAttrs(pointInputEl, {
          id: pointId,
          type: `radio`,
          name: pickUpCityId,
          value: address,
          fieldType: `pickup`,
          checked: !index
        });

        setElementAttrs(pointLabelEl, {
          htmlFor: pointId,
          innerHTML: address
        });

        addressEl.append(pointInputEl);
        addressEl.append(pointLabelEl);

        this._map.setMarker(coordinates);
      });

      addressesEl.append(addressEl);
    });

    citiesListEl.querySelector(`input`).checked = true;
    this._updateAddress();
  }

  _updateAddress() {
    const selectedCityId = document.querySelector(`input[name="city"]:checked`).id;
    const cityAddresses = [...document.querySelectorAll(`.js_address`)];
    const selectedCityAddresses = cityAddresses.find((c) => c.dataset.cityId === selectedCityId);

    cityAddresses.forEach((c) => c.classList.add(`hidden`));
    selectedCityAddresses.classList.remove(`hidden`);

    const selectedAddress = selectedCityAddresses.querySelector(`input:checked`);
    const coordinates = selectedAddress.dataset.coordinates.split(`,`);

    if (coordinates) {
      this._map.updateMapView(coordinates);
    }
  }

  _addEventListener() {
    const form = document.querySelector(`form`);

    form.addEventListener(`change`, (e) => {
      if (e.target.name === `city` || e.target.name.includes(`pick-up-`)) {
        this._updateAddress();
      }
    });
  }

  init() {
    this._getAllCities()
      .then(() => {
        this._renderAddresses();
        this._addEventListener();
      });
  }
}
