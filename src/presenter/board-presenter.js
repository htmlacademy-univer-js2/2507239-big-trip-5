import {render} from '../render.js';
import PointView from '../view/point-view.js';
import PointEditView from '../view/point-edit-view.js';
import SortView from '../view/sort-view.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    const points = this.#pointsModel.points;
    render(new SortView(), this.#boardContainer);

    const tripEventsList = document.createElement('ul');
    tripEventsList.classList.add('trip-events__list');
    this.#boardContainer.append(tripEventsList);

    // Форма редактирования - первый элемент списка
    render(new PointEditView(points[0]), tripEventsList);

    // Отрисовка остальных точек маршрута
    for (let i = 1; i < points.length; i++) {
      render(new PointView(points[i]), tripEventsList);
    }
  }
}
