import {generateMockRoutePoints, DESTINATIONS, OFFERS_BY_TYPE} from '../mock/point.js';

const adaptPointData = (point) => {
  const destination = DESTINATIONS.find((dest) => dest.id === point.destination);
  const pointOffers = OFFERS_BY_TYPE[point.type] || [];
  const selectedOffers = pointOffers.filter((offer) => point.offers.includes(offer.id));

  return {
    ...point,
    destination,
    selectedOffers
  };
};

export default class PointsModel {
  #points = [];
  #destinations = DESTINATIONS;
  #offersByType = OFFERS_BY_TYPE;

  constructor() {
    const mockPoints = generateMockRoutePoints(5);
    this.#points = mockPoints.map(adaptPointData);
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offersByType() {
    return this.#offersByType;
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1),
    ];
  }

  setPoints(points) {
    this.#points = [...points];
  }
}

