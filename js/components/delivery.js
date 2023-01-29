import {validate, setValid, stringToMs} from '../helpers.js';
import {KeyCode} from '../constants.js';

const MS_IN_MINUTE = 60000;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_HOUR = 3600;

export default class Delivery {
  constructor(timeMin, timeMax, timeStep) {
    this._timeMin = timeMin;
    this._timeMax = timeMax;
    this._timeStep = timeStep;

    this.isAddressValid = false;
    this.isDateValid = false;
  }

  _convertTimeStringToMs(time) {
    const timeParts = time.split(`:`);
    return +timeParts[0] * (MS_IN_MINUTE * MINUTES_IN_HOUR) + (+timeParts[1] * MS_IN_MINUTE);
  }

  _addLeadingZero(num) {
    return (num < 10 ? `0` : ``) + num;
  }

  _convertTimeMsToString(timeMs) {
    let s = timeMs / 1000;
    const h = parseInt(s / SECONDS_IN_HOUR, 10);
    s = s % SECONDS_IN_HOUR;
    const m = parseInt(s / MINUTES_IN_HOUR, 10);

    return this._addLeadingZero(h) + `:` + this._addLeadingZero(m);
  }

  _getTimeScale() {
    const msMin = this._convertTimeStringToMs(this._timeMin);
    const msMax = this._convertTimeStringToMs(this._timeMax);
    const msStep = this._convertTimeStringToMs(this._timeStep);
    const timeScale = [];

    for (let ms = msMin; ms < msMax + msStep; ms += msStep) {
      timeScale.push(ms);
    }

    return timeScale;
  }

  updateTooltip(offsetX, maxX, timePos) {
    const timeScale = this._getTimeScale();

    if (!timePos) {
      const percent = maxX ? (offsetX / maxX) * 100 : 0;
      timePos = Math.round(percent / (100 / (timeScale.length - 7)));
    }

    const tooltip = document.querySelector(`.js_range-slider-tooltip`);
    const timeStart = this._convertTimeMsToString(timeScale[timePos]);
    const timeEnd = this._convertTimeMsToString(timeScale[timePos] + (2 * SECONDS_IN_HOUR * 1000));

    tooltip.innerHTML = `${timeStart} - ${timeEnd}`;
  }

  _initRangeSlider() {
    const d = document;
    const thumb = document.querySelector(`.js_range-slider-thumb`);

    let startX = 0;

    const drag = (e) => {
      const maxX = document.querySelector(`.js_range-slider-thumb-area`).offsetWidth;
      let offsetX = (e ? e.pageX : 0) - startX;

      if (offsetX <= 0) {
        offsetX = 0;
      } else if (offsetX > maxX) {
        offsetX = maxX;
      }

      this.updateTooltip(offsetX, maxX);
      thumb.style.left = `${offsetX}px`;
    };

    const dragStart = (e) => {
      startX = e.pageX - (parseInt(thumb.style.left, 10) || 0);
      d.addEventListener(`mousemove`, drag);
      d.addEventListener(`mouseup`, dragEnd);
    };

    const dragEnd = () => {
      d.removeEventListener(`mousemove`, drag);
      d.removeEventListener(`mouseup`, dragEnd);
    };

    thumb.addEventListener(`mousedown`, dragStart);

    this.updateTooltip(null, null, 0);
  }

  _initAddress() {
    const addressBlock = document.querySelector(`.js_delivery-address`);
    const addressInput = addressBlock.querySelector(`#delivery-address`);

    addressInput.addEventListener(`input`, (e) => {
      this.isAddressValid = !!e.target.value;
      validate(addressBlock, this.isAddressValid);
    });

    this.isAddressValid = false;
  }

  _initDate() {
    const dateBlock = document.querySelector(`.js_delivery-date`);
    const dateInput = dateBlock.querySelector(`#delivery-date`);
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const weekFromToday = new Date(today);
    weekFromToday.setDate(weekFromToday.getDate() + 7);
    weekFromToday.setHours(0, 0, 0, 0);

    const tomorrowMs = tomorrow.getTime();
    const weekFromTodayMs = weekFromToday.getTime();

    dateInput.placeholder = tomorrow.toLocaleDateString(`en-GB`);

    /* eslint-disable-next-line */
    const dateField = IMask(dateInput, {
      mask: Date,
      pattern: `d/\`m/\`Y`,
      overwrite: true,
      autofix: true,
      format: (date) => {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (day < 10) {
          day = `0` + day;
        }
        if (month < 10) {
          month = `0` + month;
        }

        return [day, month, year].join(`/`);
      },
      parse: (str) => {
        const dayMonthYear = str.split(`/`);
        return new Date(dayMonthYear[2], dayMonthYear[1] - 1, dayMonthYear[0]);
      },
    });

    dateInput.addEventListener(`input`, (e) => {
      setValid(e.target);

      const value = dateField.value;
      const isCorrect =
        (weekFromTodayMs >= stringToMs(value)) &&
        (stringToMs(value) >= tomorrowMs);

      this.isDateValid = value && isCorrect;
      validate(dateBlock, this.isDateValid);
    });

    this.isDateValid = false;
  }

  _initKeyNavigation() {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const keyCode = e.which || e.keyCode;
      const isShift = e.shiftKey;
      const isCursorLeft = keyCode === KeyCode.CURSOR_LEFT;
      const isCursorRight = keyCode === KeyCode.CURSOR_RIGHT;
      const isInInput = e.target.tagName === `INPUT`;

      if (!isShift || isInInput) {
        return;
      }

      if (activeEl.classList.contains(`js_range-slider-thumb`)) {
        const thumb = document.querySelector(`.js_range-slider-thumb`);
        const pos = parseInt(thumb.style.left, 10);
        const maxX = document.querySelector(`.js_range-slider-thumb-area`).offsetWidth;
        const speed = 10;
        let newPos = pos;

        if (isCursorLeft) {
          newPos = pos - 10 > 0 ? pos - 10 : 0;
        }

        if (isCursorRight) {
          newPos = pos + speed < maxX ? pos + speed : maxX;
        }

        thumb.style.left = `${newPos}px`;
        this.updateTooltip(newPos, maxX);
      }
    };

    document.addEventListener(`keydown`, handleKeyDown);
  }

  init() {
    this._initRangeSlider();
    this._initAddress();
    this._initDate();
    this._initKeyNavigation();
  }
}
