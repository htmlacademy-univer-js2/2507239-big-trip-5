import {render, remove} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';
import {sortPointsByDay, sortPointsByTime, sortPointsByPrice} from '../utils.js';
import {filter} from '../utils.js';
import {UpdateType, UserAction, FilterType} from '../const.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #filtersModel = null;
  #tripEventsList = null;
  #sortComponent = null;
  #emptyListComponent = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #newPointPresenter = null;

  constructor({boardContainer, pointsModel, filtersModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filtersModel = filtersModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filtersModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const currentFilterType = this.#filtersModel.filter;
    const allPoints = this.#pointsModel.points;
    const filteredPoints = filter[currentFilterType](allPoints);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(sortPointsByTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortPointsByPrice);
      case SortType.DAY:
      default:
        return filteredPoints.sort(sortPointsByDay);
    }
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offersByType() {
    return this.#pointsModel.offersByType;
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#filtersModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#currentSortType = SortType.DAY;

    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }

  }

  #handleViewAction = (actionType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
    }
  };

  #handlePointDataChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
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

    if (this.#tripEventsList) {
      this.#tripEventsList.remove();
      this.#tripEventsList = null;
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
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderEmptyList() {
    const filterType = this.#filtersModel.filter;
    this.#emptyListComponent = new EmptyPointsView({
      messageType: filterType
    });
    render(this.#emptyListComponent, this.#boardContainer);
  }

  #renderPoints() {
    const pointsToRender = this.points;
    for (let i = 0; i < pointsToRender.length; i++) {
      this.#renderPoint(pointsToRender[i]);
    }
  }

  #renderBoard() {
    if (!this.#sortComponent) {
      this.#renderSort();
    }

    const pointsToRender = this.points;

    if (pointsToRender.length === 0) {
      this.#clearPointsList();
      if(this.#tripEventsList) {
        remove(this.#tripEventsList);
        this.#tripEventsList = null;
      }
      this.#renderEmptyList();
      return;
    }

    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }

    if (!this.#tripEventsList) {
      this.#tripEventsList = document.createElement('ul');
      this.#tripEventsList.classList.add('trip-events__list');
      this.#boardContainer.insertBefore(this.#tripEventsList, this.#sortComponent.element.nextSibling);
    }
    this.#renderPoints();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#tripEventsList,
      destinations: this.destinations,
      offersByType: this.offersByType,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handlePointModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
