// src/api-service.js

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class ApiService {
  #endPoint = null;
  #authorization = null;

  constructor(endPoint, authorization) {
    this.#endPoint = endPoint;
    this.#authorization = authorization;
  }

  async getPoints() {
    return this.#load({url: 'points'})
      .then(ApiService.parseResponse);
  }

  async getDestinations() {
    return this.#load({url: 'destinations'})
      .then(ApiService.parseResponse);
  }

  async getOffers() {
    return this.#load({url: 'offers'})
      .then(ApiService.parseResponse);
  }

  // Метод для обновления точки (понадобится позже, но спроектируем интерфейс)
  // async updatePoint(point) {
  //   return this.#load({
  //     url: `points/${point.id}`,
  //     method: Method.PUT,
  //     body: JSON.stringify(this.#adaptToServer(point)), // Нужен адаптер к серверу
  //     headers: new Headers({'Content-Type': 'application/json'}),
  //   })
  //     .then(ApiService.parseResponse);
  // }

  async #load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers(),
  }) {
    headers.append('Authorization', this.#authorization);

    const response = await fetch(
      `${this.#endPoint}/${url}`,
      {method, body, headers},
    );

    try {
      ApiService.checkStatus(response);
      return response;
    } catch (err) {
      ApiService.catchError(err);
    }
  }

  static parseResponse(response) {
    return response.json();
  }

  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  }

  static catchError(err) {
    throw err;
  }

  // #adaptToServer(point) {
  //   // Логика адаптации данных точки к формату сервера
  //   const adaptedPoint = {...point};
  //   // ... преобразования ...
  //   return adaptedPoint;
  // }
}
