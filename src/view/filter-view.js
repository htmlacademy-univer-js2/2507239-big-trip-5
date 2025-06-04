import AbstractView from '../framework/view/abstract-view.js';
import { escapeHtml } from '../utils.js';

const createFilterItemTemplate = (filter, currentFilterType) => (
  `<div class="trip-filters__filter">
    <input
      id="filter-${escapeHtml(filter.type)}"
      class="trip-filters__filter-input  visually-hidden"
      type="radio"
      name="trip-filter"
      value="${escapeHtml(filter.type)}"
      ${filter.type === currentFilterType ? 'checked' : ''}
      ${filter.isDisabled ? 'disabled' : ''}
      ${filter.count === 0 && filter.type !== 'everything' ? 'disabled' : ''}
    >
    <label class="trip-filters__filter-label" for="filter-${escapeHtml(filter.type)}">${escapeHtml(filter.name)}</label>
  </div>`
);

const createFilterTemplate = (filterItems, currentFilterType) => {
  const filterItemsTemplate = filterItems
    .map((filter) => createFilterItemTemplate(filter, currentFilterType))
    .join('');

  return (
    `<form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
};

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  #handleFilterTypeChange = null;

  constructor({filters, currentFilterType, onFilterTypeChange}) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    if (this.#handleFilterTypeChange) {
      this.element.addEventListener('change', this.#filterTypeChangeHandler);
    }
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilterType);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };
}
