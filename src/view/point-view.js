import AbstractView from '../framework/view/abstract-view.js';
import { formatDateToMonthDay, formatTimeToHourMinute, formatDuration } from '../utils.js';

const createPointTemplate = (point) => {
  const destinationName = point.destination?.name || 'Unknown destination';
  const selectedOffers = point.selectedOffers || [];

  const dateForHeader = formatDateToMonthDay(point.dateFrom);
  const timeFrom = formatTimeToHourMinute(point.dateFrom);
  const timeTo = formatTimeToHourMinute(point.dateTo);
  const duration = formatDuration(point.dateFrom, point.dateTo);

  return `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${point.dateFrom}">${dateForHeader}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${point.type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${point.type} ${destinationName}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${point.dateFrom}">${timeFrom}</time>
          —
          <time class="event__end-time" datetime="${point.dateTo}">${timeTo}</time>
        </p>
        <p class="event__duration">${duration}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${point.basePrice}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${selectedOffers.map((offer) => `
          <li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            +€
            <span class="event__offer-price">${offer.price}</span>
          </li>
        `).join('')}
      </ul>
      <button class="event__favorite-btn ${point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
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

export default class PointView extends AbstractView {
  #point = null;
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({point, onEditClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createPointTemplate(this.#point);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
