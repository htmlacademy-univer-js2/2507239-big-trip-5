import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';
import {render} from './framework/render.js';
import FilterView from './view/filter-view.js';
import SortView from './view/sort-view.js';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');

const pointsModel = new PointsModel();
const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  pointsModel
});

render(new FilterView(), siteHeaderElement);
boardPresenter.init();

const sortComponent = new SortView();
render(sortComponent, siteMainElement);
