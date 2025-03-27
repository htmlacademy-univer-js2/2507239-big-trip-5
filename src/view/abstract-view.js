import {createElement} from '../render.js';

export default class AbstractView {
  #element = null;
  _callback = {};

  constructor() {
    if (new.target === AbstractView) {
      throw new Error('Can\'t instantiate AbstractView, only concrete one.');
    }
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  getElement() {
    return this.element;
  }

  removeElement() {
    this.#element = null;
  }

  get template() {
    throw new Error('Abstract method not implemented: get template');
  }
}
