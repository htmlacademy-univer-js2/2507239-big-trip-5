import AbstractView from '../framework/view/abstract-view.js';

const createEmptyPointsTemplate = () => (
  '<p class="trip-events__msg">Click New Event to create your first point</p>' // Используем разметку из /markup
);

export default class EmptyPointsView extends AbstractView {
  get template() {
    return createEmptyPointsTemplate();
  }
}
