import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';
import { TYPES } from '../const.js';

const createOffersTemplate = (availableOffers, selectedOffersIds, isDisabled) => {
  if (!availableOffers || !availableOffers.length) {
    return '';
  }
  return `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${availableOffers.map((offer) => `
        <div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" data-offer-id="${offer.id}" ${selectedOffersIds.includes(offer.id) ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
          <label class="event__offer-label" for="event-offer-${offer.id}">
            <span class="event__offer-title">${offer.title}</span>
            +€
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `).join('')}
    </div>
  </section>`;
};

const createDestinationTemplate = (destination) => {
  if (!destination || !destination.name) {
    return '';
  }
  const picturesTemplate = destination.pictures && destination.pictures.length
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${destination.pictures.map((picture) => `
            <img class="event__photo" src="${picture.src}" alt="${picture.description}">
          `).join('')}
        </div>
      </div>`
    : '';

  return `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${destination.description || ''}</p>
    ${picturesTemplate}
  </section>`;
};

const createPointEditTemplate = (_state, destinationsList, offersByType) => {
  const currentDestination = _state.destination;
  const availableOffers = offersByType[_state.type] || [];

  const formatForFlatpickr = (dateString) => dateString ? dayjs(dateString).format('DD/MM/YY HH:mm') : '';

  let resetButtonText;
  if (_state.isDeleting) {
    resetButtonText = 'Deleting...';
  } else {
    if (_state.id !== undefined) {
      resetButtonText = 'Delete';
    } else {
      resetButtonText = 'Cancel';
    }
  }

  return `<form class="event event--edit ${_state.isShake ? 'shake' : ''}" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${_state.type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${_state.isDisabled ? 'disabled' : ''}>
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${TYPES.map((type) => `
              <div class="event__type-item">
                <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${type === _state.type ? 'checked' : ''} ${_state.isDisabled ? 'disabled' : ''}>
                <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
              </div>
            `).join('')}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${_state.type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination ? currentDestination.name : ''}" list="destination-list-1" ${_state.isDisabled ? 'disabled' : ''}>
        <datalist id="destination-list-1">
          ${destinationsList.map((dest) => `<option value="${dest.name}"></option>`).join('')}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatForFlatpickr(_state.dateFrom)}" ${_state.isDisabled ? 'disabled' : ''}>
        —
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatForFlatpickr(_state.dateTo)}" ${_state.isDisabled ? 'disabled' : ''}>
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          €
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${_state.basePrice}" min="0" ${_state.isDisabled ? 'disabled' : ''}>
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit" ${_state.isDisabled ? 'disabled' : ''}>
        ${_state.isSaving ? 'Saving...' : 'Save'}
      </button>
      <button class="event__reset-btn" type="reset" ${_state.isDisabled ? 'disabled' : ''}>
        ${resetButtonText}
      </button>
      <button class="event__rollup-btn" type="button" ${_state.isDisabled ? 'disabled' : ''}>
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    ${createOffersTemplate(availableOffers, _state.offers, _state.isDisabled)}
    ${createDestinationTemplate(currentDestination)}
  </form>`;
};

export default class PointEditView extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleRollUpClick = null;
  #handleDeleteClick = null;
  #allDestinations = [];
  #allOffersByType = {};
  #datepickerFrom = null;
  #datepickerTo = null;

  static parsePointToState(point, allDestinations) {
    const state = structuredClone(point);
    if (typeof state.destination === 'number' || typeof state.destination === 'string') {
      state.destination = allDestinations.find((dest) => dest.id === state.destination) || null;
    }
    return {
      ...state,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
      isShake: false,
    };
  }

  constructor({point, onFormSubmit, onRollUpClick, onDeleteClick, destinations, offersByType}) {
    super();
    this.#allDestinations = destinations;
    this.#allOffersByType = offersByType;
    this._state = PointEditView.parsePointToState(point, this.#allDestinations, this.#allOffersByType);
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollUpClick = onRollUpClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  get template() {
    return createPointEditTemplate(this._state, this.#allDestinations, this.#allOffersByType);
  }

  removeElement() {
    super.removeElement();
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  _restoreHandlers() {
    if (this._state.isDisabled) {
      return;
    }
    this.element.addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollUpClickHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);

    const offersElement = this.element.querySelector('.event__available-offers');
    if (offersElement) {
      offersElement.addEventListener('change', this.#offerChangeHandler);
    }

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (resetButton && this.#handleDeleteClick) {
      resetButton.addEventListener('click', this.#resetButtonClickHandler);
    }

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);

    this.#setDatepickers();
  }

  #setDatepickers() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }

    const commonConfig = {
      enableTime: true,
      'time_24hr': true,
      dateFormat: 'Z',
      altInput: true,
      altFormat: 'd/m/y H:i',
      allowInput: true,
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom || 'today',
        onClose: ([userDate]) => {
          this.updateElement({ dateFrom: userDate ? userDate.toISOString() : null });
          if (this.#datepickerTo) {
            this.#datepickerTo.set('minDate', userDate || null);
          }
        },
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo || 'today',
        minDate: this._state.dateFrom || null,
        onClose: ([userDate]) => {
          this.updateElement({ dateTo: userDate ? userDate.toISOString() : null });
        },
      }
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    const pointToSubmit = PointEditView.parseStateToPoint(this._state);
    if (typeof pointToSubmit.basePrice !== 'number') {
      pointToSubmit.basePrice = Number(pointToSubmit.basePrice) || 0;
    }
    this.#handleFormSubmit(pointToSubmit);
  };

  #rollUpClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollUpClick();
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.classList.contains('event__type-input')) {
      this.updateElement({
        type: evt.target.value,
        offers: []
      });
    }
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const enteredValue = evt.target.value.trim();

    const selectedDestination = this.#allDestinations.find(
      (dest) => dest.name.toLowerCase() === enteredValue.toLowerCase()
    );

    if (selectedDestination) {
      this.updateElement({
        destination: selectedDestination,
      });
    } else {
      evt.target.value = '';
    }
  };

  #offerChangeHandler = (evt) => {
    if (evt.target.classList.contains('event__offer-checkbox')) {
      const offerId = evt.target.dataset.offerId;
      let updatedOffers = [...this._state.offers];

      if (evt.target.checked) {
        if (!updatedOffers.includes(offerId)) {
          updatedOffers.push(offerId);
        }
      } else {
        updatedOffers = updatedOffers.filter((id) => id !== offerId);
      }
      this.updateElement({ offers: updatedOffers });
    }
  };

  #resetButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(PointEditView.parseStateToPoint(this._state));
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    let priceValue = evt.target.value;

    priceValue = priceValue.replace(/[^\d]/g, '');

    if (priceValue.length > 1 && priceValue.startsWith('0')) {
      priceValue = priceValue.substring(1);
    }

    if (priceValue === '') {
      priceValue = '0';
    }

    evt.target.value = priceValue;

    this.updateElement({
      basePrice: Number(priceValue)
    });
  };

  reset(point) {
    this.updateElement(PointEditView.parsePointToState(point, this.#allDestinations, this.#allOffersByType));
  }

  static parseStateToPoint(state) {
    const point = {...state};
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    delete point.isShake;
    return point;
  }
}
