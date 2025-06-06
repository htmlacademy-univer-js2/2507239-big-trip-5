import Observable from '../framework/observable.js';
import {UpdateType} from '../const.js';

export default class PointsModel extends Observable {
  #apiService = null;
  #points = [];
  #destinations = [];
  #offersByType = [];
  #isLoadFailed = false;

  constructor({apiService}) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offersByType() {
    const offersMap = {};
    this.#offersByType.forEach((offerType) => {
      offersMap[offerType.type] = offerType.offers;
    });
    return offersMap;
  }

  get rawOffers() {
    return this.#offersByType;
  }

  get isLoadFailed() {
    return this.#isLoadFailed;
  }

  async init() {
    this.#isLoadFailed = false;
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiService.getPoints(),
        this.#apiService.getDestinations(),
        this.#apiService.getOffers(),
      ]);

      this.#points = points.map(this.#adaptPointToClient);
      this.#destinations = destinations;
      this.#offersByType = offers;
    } catch(err) {
      this.#points = [];
      this.#destinations = [];
      this.#offersByType = [];
      this.#isLoadFailed = true;
    }
    this._notify(UpdateType.INIT);
  }

  #adaptPointToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      isFavorite: point.is_favorite,
    };

    delete adaptedPoint.base_price;
    delete adaptedPoint.date_from;
    delete adaptedPoint.date_to;
    delete adaptedPoint.is_favorite;

    return adaptedPoint;
  }

  async updatePoint(point) {
    const updatedPointFromServer = await this.#apiService.updatePoint(point);
    const adaptedPoint = this.#adaptPointToClient(updatedPointFromServer);

    const index = this.#points.findIndex((p) => p.id === adaptedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point in local model');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      adaptedPoint,
      ...this.#points.slice(index + 1),
    ];
    this._notify(UpdateType.PATCH, adaptedPoint);
    return adaptedPoint;
  }

  async addPoint(point) {
    const newPointFromServer = await this.#apiService.addPoint(point);
    const adaptedNewPoint = this.#adaptPointToClient(newPointFromServer);

    this.#points = [
      adaptedNewPoint,
      ...this.#points,
    ];
    this._notify(UpdateType.MAJOR, adaptedNewPoint);
    return adaptedNewPoint;
  }

  async deletePoint(pointToDelete) {
    await this.#apiService.deletePoint(pointToDelete);

    const index = this.#points.findIndex((point) => point.id === pointToDelete.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point from local model');
    }
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(UpdateType.MAJOR, pointToDelete);
  }

}

