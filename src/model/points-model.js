import {generateMockRoutePoints} from '../mock/point.js';

export default class PointsModel {
  #points = [];

  constructor() {
    this.#points = generateMockRoutePoints();
  }

  get points() {
    return this.#points;
  }

  init() {
    this.#points = generateMockRoutePoints();
  }
}

