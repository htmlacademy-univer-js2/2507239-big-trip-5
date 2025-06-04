import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { formatDateToMonthDay, formatTimeToHourMinute, formatDuration, escapeHtml } from '../utils.js';

const createPointTemplate = (point) => {
  const destinationName = point.destination?.name || 'Unknown destination';
  const selectedOffers = point.selectedOffers || [];

  const dateForHeader = formatDateToMonthDay(point.dateFrom);
  const timeFrom = formatTimeToHourMinute(point.dateFrom);
  const timeTo = formatTimeToHourMinute(point.dateTo);
  const duration = formatDuration(point.dateFrom, point.dateTo);

  return `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${escapeHtml(point.dateFrom)}">${escapeHtml(dateForHeader)}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${escapeHtml(point.type)}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${escapeHtml(point.type)} ${escapeHtml(destinationName)}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${escapeHtml(point.dateFrom)}">${escapeHtml(timeFrom)}</time>
          —
          <time class="event__end-time" datetime="${escapeHtml(point.dateTo)}">${escapeHtml(timeTo)}</time>
        </p>
        <p class="event__duration">${escapeHtml(duration)}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${escapeHtml(point.basePrice)}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${selectedOffers.map((offer) => `
          <li class="event__offer">
            <span class="event__offer-title">${escapeHtml(offer.title)}</span>
            +€
            <span class="event__offer-price">${escapeHtml(offer.price)}</span>
          </li>
        `).join('')}
      </ul>
      <button class="event__favorite-btn ${point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button" ${point.isFavoriteProcessing ? 'disabled' : ''}>
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class PointView extends AbstractStatefulView {
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({point, onEditClick, onFavoriteClick}) {
    super();
    this._state = PointView.parsePointToState(point);
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.#setHandlers();
  }

  get template() {
    return createPointTemplate(this._state);
  }

  _restoreHandlers() {
    this.#setHandlers();
  }

  #setHandlers() {
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isFavoriteProcessing) {
      return;
    }
    this.updateElement({ isFavoriteProcessing: true });
    this.#handleFavoriteClick();
  };

  static parsePointToState(point) {
    return {
      ...point,
      isFavoriteProcessing: false,
    };
  }
}
