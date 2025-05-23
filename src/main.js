import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FiltersModel from './model/filters-model.js';
import ApiService from './api.js';

const AUTHORIZATION = 'Basic hS2sfS44wcl1sa2j';
const END_POINT = 'https://21.objects.pages.academy/big-trip';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');

const apiService = new ApiService(END_POINT, AUTHORIZATION);

const pointsModel = new PointsModel({apiService});
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
pointsModel.init();
