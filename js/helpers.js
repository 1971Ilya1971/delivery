import {KeyCode} from './constants.js';

export const setElementAttrs = (el, attrs) =>
  Object.entries(attrs).forEach(([attr, value]) => {
    el[attr] = value;
  });

export const validate = (el, validator) => {
  el.classList.toggle(`input-wrapper--success`, validator);
  el.classList.toggle(`input-wrapper--error`, !validator);
};

export const setValid = (el) => validate(el, true);
export const setInvalid = (el) => validate(el, false);

export const stringToDate = (str) => {
  const parts = str.split(`/`);
  return new Date(+parts[2], parts[1] - 1, +parts[0]);
};

export const stringToMs = (str) => stringToDate(str).getTime();

export const isBackspace = (e) => e.keyCode === KeyCode.BACKSPACE;

