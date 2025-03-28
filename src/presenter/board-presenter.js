import {render, replace} from '../framework/render.js';
import PointView from '../view/point-view.js';
import PointEditView from '../view/point-edit-view.js';
import SortView from '../view/sort-view.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #tripEventsList = null;

  #pointComponent = null;
  #pointEditComponent = null;

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    const points = this.#pointsModel.points;
    render(new SortView(), this.#boardContainer);

    this.#tripEventsList = document.createElement('ul');
    this.#tripEventsList.classList.add('trip-events__list');
    this.#boardContainer.append(this.#tripEventsList);

    for (let i = 0; i < points.length; i++) {
      this.#renderPoint(points[i]);
    }
  }

  #renderPoint(point) {
    this.#pointComponent = new PointView({
      point: point,
      onEditClick: () => {
        replace(this.#pointEditComponent, this.#pointComponent);
        document.addEventListener('keydown', this.#escKeyDownHandler);
      }
    });

    this.#pointEditComponent = new PointEditView({
      point: point,
      onFormSubmit: () => {
        replace(this.#pointComponent, this.#pointEditComponent);
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      },
      onRollUpClick: () => {
        replace(this.#pointComponent, this.#pointEditComponent);
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      }
    });

    render(this.#pointComponent, this.#tripEventsList);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      replace(this.#pointComponent, this.#pointEditComponent);
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };
}
