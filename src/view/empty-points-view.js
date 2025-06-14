import AbstractView from '../framework/view/abstract-view.js';
import {FilterType} from '../const.js';
import { escapeHtml } from '../utils.js';

const EmptyListMessages = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

const createEmptyPointsTemplate = (message) => (
  `<p class="trip-events__msg">${escapeHtml(message)}</p>`
);

export default class EmptyPointsView extends AbstractView {
  #message = null;

  constructor({messageType = FilterType.EVERYTHING, customMessage = null} = {}) {
    super();
    if (customMessage !== null) {
      this.#message = customMessage;
    } else {
      this.#message = EmptyListMessages[messageType] || EmptyListMessages[FilterType.EVERYTHING];
    }
  }

  get template() {
    return createEmptyPointsTemplate(this.#message);
  }
}
