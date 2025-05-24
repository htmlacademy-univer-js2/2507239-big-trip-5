import {render, remove, RenderPosition} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';
import {sortPointsByDay, sortPointsByTime, sortPointsByPrice} from '../utils.js';
import {filter} from '../utils.js';
import {UpdateType, UserAction, FilterType, BLANK_POINT} from '../const.js';
import LoadingView from '../view/loading-view.js';
import PointEditView from '../view/point-edit-view.js';

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
  #loadingComponent = null;
  #isLoading = true;
  #newPointFormComponent = null;
  #isCreatingNewPoint = false;
  #uiBlocker = null;

  constructor({boardContainer, pointsModel, filtersModel, uiBlocker}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filtersModel = filtersModel;
    this.#uiBlocker = uiBlocker;

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
    if (this.#isCreatingNewPoint) {
      return;
    }
    this.#isCreatingNewPoint = true;

    this.#currentSortType = SortType.DAY;
    this.#filtersModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    this.#newPointFormComponent = new PointEditView({
      point: BLANK_POINT,
      destinations: this.destinations,
      offersByType: this.offersByType,
      onFormSubmit: this.#handleNewPointFormSubmit,
      onRollUpClick: this.#handleNewPointFormClose,
      onDeleteClick: this.#handleNewPointFormClose,
    });

    const targetContainer = this.#tripEventsList || this.#boardContainer;
    render(this.#newPointFormComponent, targetContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandlerForNewPoint);

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.disabled = true;
    }
  }

  #handleNewPointFormSubmit = async (pointData) => {
    this.#newPointFormComponent.updateElement({ isDisabled: true, isSaving: true, isShake: false });
    try {
      await this.#handleViewAction(UserAction.ADD_POINT, pointData);
    } catch (err) {
      if (this.#newPointFormComponent && this.#newPointFormComponent.element && document.body.contains(this.#newPointFormComponent.element)) {
        this.#newPointFormComponent.shake(() => {
          if (this.#newPointFormComponent && this.#newPointFormComponent.element && document.body.contains(this.#newPointFormComponent.element)) {
            this.#newPointFormComponent.updateElement({ isDisabled: false, isSaving: false });
          }
        });
      }
    }
  };

  #handleNewPointFormClose = () => {
    if (!this.#newPointFormComponent) {
      return;
    }
    this.#isCreatingNewPoint = false;
    remove(this.#newPointFormComponent);
    this.#newPointFormComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandlerForNewPoint);

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.disabled = false;
    }

    if (this.points.length === 0 && !this.#emptyListComponent) {
      this.#clearPointsList();
      if(this.#tripEventsList) {
        remove(this.#tripEventsList);
        this.#tripEventsList = null;
      }
      this.#renderEmptyList();
    }
  };

  #escKeyDownHandlerForNewPoint = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#handleNewPointFormClose();
    }
  };

  #handleViewAction = async (actionType, update) => {
    this.#uiBlocker.block();

    let success = false;

    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          this.#pointPresenters.get(update.id)?.setSaving();
          try {
            await this.#pointsModel.updatePoint(update);
            success = true;
          } catch (errInternal) {
            this.#pointPresenters.get(update.id)?.setAborting();
          }
          break;
        case UserAction.ADD_POINT:
          this.#newPointFormComponent?.updateElement({ isDisabled: true, isSaving: true, isShake: false });
          try {
            await this.#pointsModel.addPoint(update);
            success = true;
          } catch (errInternal) {
            this.#newPointFormComponent?.shake(() => {
              this.#newPointFormComponent.updateElement({ isDisabled: false, isSaving: false });
            });
          }
          break;
        case UserAction.DELETE_POINT:
          this.#pointPresenters.get(update.id)?.setDeleting();
          try {
            await this.#pointsModel.deletePoint(update);
            success = true;
          } catch (errInternal) {
            this.#pointPresenters.get(update.id)?.setAborting();
          }
          break;
      }
    } catch (errOuter) {
      // console.error('[BoardPresenter] #handleViewAction - Outer logic or UI method error:', errOuter);
    } finally {
      this.#uiBlocker.unblock();
    }

    if (!success && actionType === UserAction.UPDATE_POINT && update.isFavorite !== undefined) {
      // Дополнительная проверка для обновления Favorite
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
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#loadingComponent = null;
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
    if (this.#newPointFormComponent) {
      this.#handleNewPointFormClose();
    }

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
    const ERROR_LOAD_MESSAGE = 'Failed to load latest route information';
    let messageToShow;

    if (this.#pointsModel.isLoadFailed) {
      messageToShow = ERROR_LOAD_MESSAGE;
    }

    if (messageToShow) {
      this.#emptyListComponent = new EmptyPointsView({ customMessage: messageToShow });
    } else {
      this.#emptyListComponent = new EmptyPointsView({ messageType: this.#filtersModel.filter });
    }

    render(this.#emptyListComponent, this.#boardContainer);
  }

  #renderPoints() {
    const pointsToRender = this.points;
    for (let i = 0; i < pointsToRender.length; i++) {
      this.#renderPoint(pointsToRender[i]);
    }
  }

  #renderBoard() {
    if (this.#isLoading) {
      if (this.#loadingComponent === null) {
        this.#loadingComponent = new LoadingView();
        render(this.#loadingComponent, this.#boardContainer);
      }
      return;
    }

    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }

    const points = this.points;

    if (points.length === 0 && !this.#newPointPresenter) {
      this.#clearPointsList();
      if (this.#tripEventsList) {
        remove(this.#tripEventsList);
        this.#tripEventsList = null;
      }
      remove(this.#sortComponent);
      this.#sortComponent = null;
      this.#renderEmptyList();
      return;
    }

    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }

    if(!this.#sortComponent) {
      this.#renderSort();
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
