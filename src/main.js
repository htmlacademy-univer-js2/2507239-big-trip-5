import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FiltersModel from './model/filters-model.js';
import TripApiService from './trip-api-service.js';
import UiBlocker from './framework/ui-blocker/ui-blocker.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';

const AUTHORIZATION = 'Basic hS2sfS44wcl1sa2j';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');
const siteTripMainElement = document.querySelector('.trip-main');

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const tripApiService = new TripApiService(END_POINT, AUTHORIZATION);
const uiBlocker = new UiBlocker({
  lowerLimit: TimeLimit.LOWER_LIMIT,
  upperLimit: TimeLimit.UPPER_LIMIT
});

const pointsModel = new PointsModel({apiService: tripApiService});
const filtersModel = new FiltersModel();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  pointsModel: pointsModel,
  filtersModel: filtersModel,
  uiBlocker: uiBlocker,
});

const filterPresenter = new FilterPresenter({
  filterContainer: siteHeaderElement,
  pointsModel: pointsModel,
  filtersModel: filtersModel,
});

const tripInfoPresenter = new TripInfoPresenter({
  tripMainContainer: siteTripMainElement,
  pointsModel: pointsModel
});

const newEventButton = document.querySelector('.trip-main__event-add-btn');

filterPresenter.init();
tripInfoPresenter.init();
boardPresenter.init();
pointsModel.init()
  .finally(() => {
    if (newEventButton) {
      newEventButton.disabled = false;
      newEventButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        boardPresenter.createPoint();
      });
    }
  });
