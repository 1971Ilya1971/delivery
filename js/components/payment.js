import {validate, setValid} from '../helpers.js';
import {KeyCode} from '../constants.js';

const MAX_CARD_LENGTH = 16;
const MAX_PHONE_LENGTH = 11;

export default class Payment {
  constructor() {
    this._cardBlock = document.querySelector(`.js_card`);

    this.isCardValid = false;
    this.isPhoneValid = false;
  }

  getPaymentMethod() {
    return document.querySelector(`input[name="payment-method"]:checked`).value;
  }

  _initPaymentMethod() {
    const form = document.querySelector(`form`);

    form.addEventListener(`change`, (e) => {
      if (e.target.name === `payment-method`) {
        this._cardBlock.classList.toggle(`hidden`, e.target.value !== `card`);
      }
    });
  }

  _checkLuhnCard(value) {
    let nCheck = 0;
    let bEven = false;
    value = value.replace(/\D/g, ``);

    for (let n = value.length - 1; n >= 0; n--) {
      let cDigit = value.charAt(n);
      let nDigit = parseInt(cDigit, 10);

      if (bEven && (nDigit *= 2) > 9) {
        nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    return !(nCheck % 10);
  }

  _initCard() {
    const cardInput = this._cardBlock.querySelector(`#card`);
    const cardFields = [...this._cardBlock.querySelectorAll(`.card-field`)];

    cardFields.forEach((field, i, arr) => {
      field.addEventListener(`keydown`, (e) => {
        const keyCode = e.which || e.keyCode;
        const isBackspace = keyCode === KeyCode.BACKSPACE;
        const isCursor = (keyCode >= KeyCode.CURSOR_LEFT && keyCode <= KeyCode.CURSOR_RIGHT);

        if (keyCode >= KeyCode.SPACE && (keyCode < KeyCode.KEY_0 || keyCode > KeyCode.KEY_9) && !isCursor) {
          e.preventDefault();
        } else {
          if (e.target.value.length === 4 && i < arr.length - 1 && !isCursor && !isBackspace) {
            arr[i + 1].focus();
          } else if ((e.target.value.length < 1 && i > 0) && isBackspace) {
            arr[i - 1].focus();
          }
        }
      });

      field.addEventListener(`input`, () => {
        const cardValue = arr.reduce((acc, cur) => {
          acc += cur.value;

          return acc;
        }, ``);
        cardInput.value = cardValue;

        const allFilled = cardValue.length === MAX_CARD_LENGTH;
        const luhnChecked = this._checkLuhnCard(cardValue);
        const isValidated = allFilled && luhnChecked;

        this.isCardValid = isValidated;
        validate(this._cardBlock, this.isCardValid);
      });
    });

    this.isCardValid = false;
  }

  _initPhone() {
    const phoneBlock = document.querySelector(`.js_phone`);
    const phoneInput = phoneBlock.querySelector(`#phone`);

    /* eslint-disable-next-line */
    const phoneField = IMask(phoneInput, {
      mask: `+{7}(000)000-00-00`
    });

    phoneInput.addEventListener(`input`, (e) => {
      setValid(e.target);

      const value = phoneField.value;
      const isCodeValid = value.indexOf(`+7`) === 0;
      const isCorrect = value.replace(/[-\+()]/g, ``).length === MAX_PHONE_LENGTH;

      this.isPhoneValid = value && isCodeValid && isCorrect;
      validate(phoneBlock, this.isPhoneValid);
    });

    this.isPhoneValid = false;
  }

  init() {
    this._initPaymentMethod();
    this._initCard();
    this._initPhone();
  }
}
