import {render, remove} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';
import {sortPointsByDay, sortPointsByTime, sortPointsByPrice} from '../utils.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #tripEventsList = null;

  #sortComponent = null;
  #emptyListComponent = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  get points() {
    const points = this.#pointsModel.points;
    switch (this.#currentSortType) {
      case SortType.TIME:
        return points.slice().sort(sortPointsByTime);
      case SortType.PRICE:
        return points.slice().sort(sortPointsByPrice);
      case SortType.DAY:
      default:
        return points.slice().sort(sortPointsByDay);
    }
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offersByType() {
    return this.#pointsModel.offersByType;
  }

  init() {
    this.#clearBoard({resetSortType: false});
    this.#renderBoard();
  }

  #handlePointDataChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearPointsList();
    this.#renderPoints();
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
    const pointsToRender = this.points;
    for (let i = 0; i < pointsToRender.length; i++) {
      this.#renderPoint(pointsToRender[i]);
    }
  }

  #renderBoard() {
    const currentPoints = this.points;
    if (currentPoints.length === 0 && !this.#emptyListComponent) {
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
      destinations: this.destinations,
      offersByType: this.offersByType,
      onDataChange: this.#handlePointDataChange,
      onModeChange: this.#handlePointModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
