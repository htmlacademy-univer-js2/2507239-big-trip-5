import {render, replace, remove} from '../framework/render.js';
import PointView from '../view/point-view.js';
import PointEditView from '../view/point-edit-view.js';
import SortView from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';

export default class BoardPresenter {
  #boardContainer = null;
  #tripEventsList = null;
  #routePoints = [];
  #destinations = [];
  #offersByType = {};

  #sortComponent = null;
  #emptyListComponent = null;


  constructor({boardContainer}) {
    this.#boardContainer = boardContainer;
  }

  init(routePoints, destinations, offersByType) {
    this.#routePoints = routePoints;
    this.#destinations = destinations;
    this.#offersByType = offersByType;

    this.#clearBoard();

    this.#renderBoard();
  }

  #clearBoard() {
    if (this.#tripEventsList) {
      this.#tripEventsList.innerHTML = '';
      remove(this.#tripEventsList);
      this.#tripEventsList = null;
    }
    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }
  }

  #renderBoard() {
    if (this.#routePoints.length === 0) {
      this.#emptyListComponent = new EmptyPointsView();
      render(this.#emptyListComponent, this.#boardContainer);
      return;
    }

    this.#sortComponent = new SortView();
    render(this.#sortComponent, this.#boardContainer);

    this.#tripEventsList = document.createElement('ul');
    this.#tripEventsList.classList.add('trip-events__list');
    this.#boardContainer.append(this.#tripEventsList);

    for (let i = 0; i < this.#routePoints.length; i++) {
      this.#renderPoint(this.#routePoints[i]);
    }
  }

  #renderPoint(point) {
    let pointComponent = null;
    let pointEditComponent = null;
    function escKeyDownHandler(evt) {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replace(pointComponent, pointEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    }
    pointComponent = new PointView({
      point: point,
      onEditClick: () => {
        replace(pointEditComponent, pointComponent);
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    pointEditComponent = new PointEditView({
      point: point,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onFormSubmit: () => {
        replace(pointComponent, pointEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onRollUpClick: () => {
        replace(pointComponent, pointEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    render(pointComponent, this.#tripEventsList);
  }
}
