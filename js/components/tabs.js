import {KeyCode} from '../constants.js';

export default class Tabs {
  constructor(blockSelector, tabsSelector) {
    this._tabsBlock = document.querySelector(blockSelector);
    this._tabs = [...this._tabsBlock.querySelectorAll(tabsSelector)];

    this.getActiveTab = this.getActiveTab.bind(this);
    this.resetTabs = this.resetTabs.bind(this);
  }

  _applyToAllTabs(callback) {
    this._tabs.forEach(callback);
  }

  _setActiveTab(el) {
    this._applyToAllTabs((tab) => tab.classList.remove(`active`));
    el.classList.add(`active`);
  }

  getActiveTab() {
    return this._tabsBlock.dataset.activeTab;
  }

  resetTabs() {
    this._tabs[0].click();
  }

  _initTabs() {
    const handleTabClick = (e) => {
      const el = e.currentTarget;
      this._tabsBlock.dataset.activeTab = el.dataset.tab;
      this._setActiveTab(el);

      document.querySelector(`form`).dispatchEvent(new Event(`input`));
    };

    this._applyToAllTabs((tab) => tab.addEventListener(`click`, handleTabClick));
    this._setActiveTab(this._tabs[0]);
  }

  _initKeyNavigation() {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const keyCode = e.which || e.keyCode;
      const isCursorLeft = keyCode === KeyCode.CURSOR_LEFT;
      const isCursorRight = keyCode === KeyCode.CURSOR_RIGHT;
      const isInInput = e.target.tagName === `INPUT`;

      if (isInInput) {
        return;
      }

      if (activeEl.classList.contains(`js_tab`)) {
        if (isCursorLeft) {
          this._tabs[0].click();
        }

        if (isCursorRight) {
          this._tabs[1].click();
        }
      }
    };

    document.addEventListener(`keydown`, handleKeyDown);
  }

  init() {
    this._initTabs();
    this._initKeyNavigation();
  }
}
