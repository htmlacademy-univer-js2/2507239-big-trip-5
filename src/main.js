import NewTaskButtonView from './view/new-task-button-view.js';
import FilterView from './view/filter-view.js';
import {render} from './render.js';
import BoardPresenter from './presenter/board-presenter.js';

const siteMainElement = document.querySelector('.page-main');
const siteHeaderElement = document.querySelector('.trip-controls__filters');
const boardPresenter = new BoardPresenter({boardContainer: siteMainElement});

render(new NewTaskButtonView(), siteHeaderElement);
render(new FilterView(), siteHeaderElement);

boardPresenter.init();
