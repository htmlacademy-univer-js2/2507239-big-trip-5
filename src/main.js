import BoardPresenter from './presenter/board-presenter.js';
import {render} from './framework/render.js';
import FilterView from './view/filter-view.js';
import PointsModel from './model/points-model.js';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');

const pointsModel = new PointsModel();

const filtersData = {
  everything: pointsModel.points.length > 0,
  future: true,
  present: true,
  past: true
};

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  pointsModel: pointsModel
});

render(new FilterView(filtersData), siteHeaderElement);

boardPresenter.init();
