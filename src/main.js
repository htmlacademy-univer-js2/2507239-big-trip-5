import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FiltersModel from './model/filters-model.js';
import TripApiService from './trip-api-service.js';

const AUTHORIZATION = 'Basic hS2sfS44wcl1sa2j';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');

const tripApiService = new TripApiService(END_POINT, AUTHORIZATION);

const pointsModel = new PointsModel({apiService: tripApiService});
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
