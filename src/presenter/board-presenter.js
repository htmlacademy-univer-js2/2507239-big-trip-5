import {render, remove} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';
import {sortPointsByDay, sortPointsByTime, sortPointsByPrice} from '../utils.js';

export default class BoardPresenter {
  #boardContainer = null;
  #tripEventsList = null;
  #routePoints = [];
  #destinations = [];
  #offersByType = {};

  #sortComponent = null;
  #emptyListComponent = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

  constructor({boardContainer}) {
    this.#boardContainer = boardContainer;
  }

  init(routePoints, destinations, offersByType) {
    this.#routePoints = [...routePoints];
    this.#destinations = destinations;
    this.#offersByType = offersByType;

    this.#sortPoints(this.#currentSortType);
    this.#clearBoard({resetSortType: false});
    this.#renderBoard();
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case SortType.TIME:
        this.#routePoints.sort(sortPointsByTime);
        break;
      case SortType.PRICE:
        this.#routePoints.sort(sortPointsByPrice);
        break;
      case SortType.DAY:
      default:
        this.#routePoints.sort(sortPointsByDay);
    }
    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#sortPoints(sortType);
    this.#clearPointsList();
    this.#renderPoints();
  };

  #handlePointDataChange = (updatedPoint) => {
    this.#routePoints = this.#routePoints.map((point) => point.id === updatedPoint.id ? updatedPoint : point);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handlePointModeChange = (activePresenter) => {
    this.#pointPresenters.forEach((presenter) => {
      if (presenter !== activePresenter) {
        presenter.resetView();
      }
    });
  };

  #clearBoard({resetSortType = false} = {}) {
    this.#clearPointsList();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }
    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    const currentSortInput = this.#sortComponent.element.querySelector(`[data-sort-type="${this.#currentSortType}"]`);
    if (currentSortInput) {
      const inputId = currentSortInput.htmlFor || currentSortInput.id;
      const inputElement = this.#sortComponent.element.querySelector(`#${inputId.startsWith('sort-') ? inputId : `sort-${this.#currentSortType}`}`);
      if(inputElement) {
        inputElement.checked = true;
      }
    }
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderPoints() {
    for (let i = 0; i < this.#routePoints.length; i++) {
      this.#renderPoint(this.#routePoints[i]);
    }
  }

  #renderBoard() {
    if (this.#routePoints.length === 0 && !this.#emptyListComponent) { // Рисуем пустое, только если его еще нет
      if (this.#tripEventsList) {
        remove(this.#tripEventsList);
        this.#tripEventsList = null;
      }
      this.#emptyListComponent = new EmptyPointsView();
      render(this.#emptyListComponent, this.#boardContainer);
      if (!this.#sortComponent) {
        this.#renderSort();
      }
      return;
    }

    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }

    if (!this.#sortComponent) {
      this.#renderSort();
    }

    if (!this.#tripEventsList) {
      this.#tripEventsList = document.createElement('ul');
      this.#tripEventsList.classList.add('trip-events__list');
      if(this.#sortComponent && this.#sortComponent.element.nextSibling) {
        this.#boardContainer.insertBefore(this.#tripEventsList, this.#sortComponent.element.nextSibling);
      } else {
        this.#boardContainer.append(this.#tripEventsList);
      }
    }
    this.#renderPoints();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#tripEventsList,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onDataChange: this.#handlePointDataChange,
      onModeChange: this.#handlePointModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
