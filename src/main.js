import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FiltersModel from './model/filters-model.js';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');

const pointsModel = new PointsModel();
const filtersModel = new FiltersModel();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  pointsModel: pointsModel,
  filtersModel: filtersModel,
});

const filterPresenter = new FilterPresenter({
  filterContainer: siteHeaderElement,
  pointsModel: pointsModel,
  filtersModel: filtersModel,
});

filterPresenter.init();
boardPresenter.init();
