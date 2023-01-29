import {API_URL} from '../constants.js';

export default class Form {
  constructor(tabs, delivery, payment) {
    this._getActiveTab = tabs.getActiveTab;
    this._resetTabs = tabs.resetTabs;
    this._delivery = delivery;
    this._payment = payment;

    this._form = document.querySelector(`.js_form`);
    this._submitBtn = this._form.querySelector(`.js_submit-btn`);
    this._fieldsState = this._form.querySelector(`.js_fields-state`);
    this._fieldsLeft = this._form.querySelector(`.js_fields-left`);

    this._validateForm = this._validateForm.bind(this);
  }

  _validateForm() {
    const {isAddressValid, isDateValid} = this._delivery;
    const {isCardValid, isPhoneValid, getPaymentMethod} = this._payment;

    const isCardRequired = getPaymentMethod() === `card`;
    const isDeliveryTab = this._getActiveTab() === `delivery`;
    const isFormValid =
      (!isDeliveryTab || isAddressValid) &&
      (!isDeliveryTab || isDateValid) &&
      (!isCardRequired || isCardValid) &&
      isPhoneValid;

    const Error = {
      ADDRESS: `<span>адрес</span>`,
      DATE: `<span>дату</span>`,
      CARD: `<span>номер карты</span>`,
      PHONE: `<span>телефон</span>`
    };

    const errors = [];

    this._submitBtn.disabled = !isFormValid;
    this._fieldsState.classList.toggle(`hidden`, isFormValid);

    if (isDeliveryTab) {
      if (!isAddressValid) {
        errors.push(Error.ADDRESS);
      }

      if (!isDateValid) {
        errors.push(Error.DATE);
      }
    }

    if (isCardRequired && !isCardValid) {
      errors.push(Error.CARD);
    }

    if (!isPhoneValid) {
      errors.push(Error.PHONE);
    }

    const errorsMsg = errors.length ? errors.reduce((acc, cur, i, arr) =>
      acc + (i < arr.length - 1 ? `, ` : ` и `) + cur) : ``;

    this._fieldsLeft.innerHTML = errorsMsg;
  }

  _serializeFields(activeTab) {
    const selectedCityEl = document.querySelector(`input[name="city"]:checked`);
    const cityId = selectedCityEl.value;
    const cityInputId = selectedCityEl.id;
    const city = document.querySelector(`label[for="${cityInputId}"]`).textContent;
    const payment = document.querySelector(`input[name="payment-method"]:checked`).value;
    const phone = document.querySelector(`#phone`).value;
    let data = {
      city,
      cityId,
      phone,
      payment
    };

    if (activeTab === `pickup`) {
      data = {
        ...data,
        address: document.querySelector(`input[name="${cityInputId}"]:checked`).value
      };
    } else {
      data = {
        ...data,
        address: document.querySelector(`#delivery-address`).value,
        date: document.querySelector(`#delivery-date`).value,
        time: document.querySelector(`.js_range-slider-tooltip`).textContent,
      };
    }

    if (payment === `card`) {
      data.card = document.querySelector(`#card`).value;
    }

    return data;
  }

  async _submitData(data) {
    let submitBtnText = this._submitBtn.textContent;

    this._submitBtn.disabled = true;
    this._submitBtn.textContent = `Подождите`;

    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: `POST`,
        headers: {
          'Content-Type': `application/json`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      this._resetForm();

      return result;
    } catch (err) {
      throw err;
    } finally {
      this._submitBtn.textContent = submitBtnText;
      this._submitBtn.disabled = false;
    }
  }

  _resetForm() {
    this._form.reset();
    this._resetTabs();

    document.querySelector(`input[name="payment-method"]`).checked = true;
    document.querySelector(`.js_card`).classList.remove(`hidden`);

    const successFields = [...document.querySelectorAll(`.input-wrapper--success`)];
    const cities = [...document.querySelectorAll(`input[name="city"]`)];

    cities.forEach((city) => {
      document.querySelector(`input[name="${city.id}"]`).checked = true;
    });
    successFields.forEach((field) => field.classList.remove(`input-wrapper--success`));

    document.querySelector(`input[name="city"]`).click();
    document.querySelector(`.js_range-slider-thumb`).style.left = 0;

    this._delivery.updateTooltip(null, null, 0);

    this._validateForm();
    this._submitBtn.disabled = true;
  }

  _initSubmit() {
    const btn = document.querySelector(`.js_submit-btn`);

    const handleSubmit = (e) => {
      e.preventDefault();
      const activeTab = this._getActiveTab();
      const data = this._serializeFields(activeTab);

      this._submitData(data);
      this._resetForm();
    };

    btn.addEventListener(`click`, handleSubmit);
  }

  init() {
    this._form.addEventListener(`input`, this._validateForm);
    this._form.addEventListener(`change`, this._validateForm);
    this._validateForm();
    this._initSubmit();
  }
}
