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
    render(new SortView(), this.#boardContainer);

    // Форма редактирования - первый элемент списка
    render(new PointEditView(), this.#boardContainer);

    // Отрисовка 3-х точек маршрута
    for (let i = 0; i < 3; i++) {
      render(new PointView(), this.#boardContainer);
    }
  }
}
