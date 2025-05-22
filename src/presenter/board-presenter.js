import {render, remove} from '../framework/render.js';
import SortView from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';

export default class BoardPresenter {
  #boardContainer = null;
  #tripEventsList = null;
  #routePoints = [];
  #destinations = [];
  #offersByType = {};

  #sortComponent = null;
  #emptyListComponent = null;
  #pointPresenters = new Map();

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
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#tripEventsList) {
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
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#tripEventsList,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
