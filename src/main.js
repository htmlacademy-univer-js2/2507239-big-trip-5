import BoardPresenter from './presenter/board-presenter.js';
import {render} from './framework/render.js';
import FilterView from './view/filter-view.js';
import {generateMockRoutePoints, DESTINATIONS, OFFERS_BY_TYPE} from './mock/point.js';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-controls__filters');

const mockRoutePoints = generateMockRoutePoints(5);

const adaptedMockRoutePoints = mockRoutePoints.map((point) => {
  const destination = DESTINATIONS.find((dest) => dest.id === point.destination);
  const pointOffers = OFFERS_BY_TYPE[point.type] || [];
  const selectedOffers = pointOffers.filter((offer) => point.offers.includes(offer.id));

  return {
    ...point,
    destination,
    selectedOffers
  };
});

const filters = {
  everything: adaptedMockRoutePoints.length > 0,
  future: true,
  present: true,
  past: true
};

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement
});

render(new FilterView(filters), siteHeaderElement);


boardPresenter.init(adaptedMockRoutePoints, DESTINATIONS, OFFERS_BY_TYPE);
