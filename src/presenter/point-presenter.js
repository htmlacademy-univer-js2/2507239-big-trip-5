import {render, replace, remove} from '../framework/render.js';
import PointView from '../view/point-view.js';
import PointEditView from '../view/point-edit-view.js';
import {UserAction} from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointListContainer = null;

  #point = null;
  #destinations = [];
  #offersByType = {};

  #pointComponent = null;
  #pointEditComponent = null;
  #mode = Mode.DEFAULT;
  #onDataChangeCallback = null;
  #onModeChangeCallback = null;

  _isFavoriteUpdating = false;

  constructor({pointListContainer, destinations, offersByType, onDataChangeCallback, onModeChangeCallback}) {
    this.#pointListContainer = pointListContainer;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
    this.#onDataChangeCallback = onDataChangeCallback;
    this.#onModeChangeCallback = onModeChangeCallback;
  }

  init(point) {
    this.#point = point;

    const pointDestinationObject = this.#destinations.find((dest) => dest.id === this.#point.destination);

    const availableOffersForType = this.#offersByType[this.#point.type] || [];
    const selectedPointOfferObjects = availableOffersForType.filter((offer) => this.#point.offers.includes(offer.id));

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    this.#pointComponent = new PointView({
      point: {
        ...this.#point,
        destination: pointDestinationObject,
        selectedOffers: selectedPointOfferObjects,
      },
      onEditClick: this.#editClickHandler,
      onFavoriteClick: this.#favoriteClickHandler,
    });

    this.#pointEditComponent = new PointEditView({
      point: this.#point,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onFormSubmit: this.#formSubmitHandler,
      onRollUpClick: this.#rollUpClickHandler,
      onDeleteClick: this.#deleteClickHandler,
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToCard();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING && this.#pointEditComponent) {
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
        isShake: false,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING && this.#pointEditComponent) {
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
        isShake: false,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.EDITING && this.#pointEditComponent) {
      const resetFormState = () => {
        if (this.#pointEditComponent && this.#pointEditComponent.element && document.body.contains(this.#pointEditComponent.element)) {
          this.#pointEditComponent.updateElement({
            isDisabled: false,
            isSaving: false,
            isDeleting: false,
            isShake: false,
          });
        }
      };
      if (this.#pointEditComponent.element && document.body.contains(this.#pointEditComponent.element)) {
        this.#pointEditComponent.shake(resetFormState);
      }
    }
  }

  #replaceCardToForm = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.EDITING;
    if (this.#onModeChangeCallback) {
      this.#onModeChangeCallback(this);
    }
  };

  #replaceFormToCard = () => {
    if (this.#pointEditComponent) {
      this.#pointEditComponent.reset(this.#point);
    }

    if (this.#pointEditComponent && this.#pointEditComponent.element.parentElement) {
      replace(this.#pointComponent, this.#pointEditComponent);
    }
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceFormToCard();
    }
  };

  #editClickHandler = () => {
    this.#replaceCardToForm();
  };

  #formSubmitHandler = async (pointFromForm) => {
    try {
      await this.#onDataChangeCallback(UserAction.UPDATE_POINT, pointFromForm);
      this.#replaceFormToCard();
    } catch (err) {
      // Оставляем форму открытой при ошибке
    }
  };

  #deleteClickHandler = async () => {
    try {
      await this.#onDataChangeCallback(UserAction.DELETE_POINT, this.#point);
    } catch (err) {
      // Обработка ошибки удаления
    }
  };

  #rollUpClickHandler = () => {
    this.#replaceFormToCard();
  };

  #favoriteClickHandler = async () => {
    if (this._isFavoriteUpdating) {
      return;
    }
    this._isFavoriteUpdating = true;

    const originalIsFavorite = this.#point.isFavorite;

    if (this.#pointComponent && typeof this.#pointComponent.updateElement === 'function') {
      this.#pointComponent.updateElement({ isFavoriteProcessing: true });
    }

    try {
      await this.#onDataChangeCallback(
        UserAction.UPDATE_POINT,
        {...this.#point, isFavorite: !this.#point.isFavorite}
      );
    } catch (err) {
      if (this.#pointComponent && typeof this.#pointComponent.updateElement === 'function') {
        this.#pointComponent.updateElement({
          isFavorite: originalIsFavorite,
          isFavoriteProcessing: false
        });
        this.#pointComponent.shake();
      }
    } finally {
      this._isFavoriteUpdating = false;
    }
  };
}
