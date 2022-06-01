import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');
  _page;

  addHandlerClick(handlerFunction) {
    this._parentElement.addEventListener('click', event => {
      const button = event.target.closest('.btn--inline');
      if (!button) return;

      const goToPage = Number(button.dataset.goto);

      handlerFunction(goToPage);
    });
  }

  _generateLeftButton() {
    return `
      <button data-goto="${
        this._page - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${this._page - 1}</span>
      </button>
    `;
  }

  _generateRightButton() {
    return `
      <button data-goto="${
        this._page + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${this._page + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
    `;
  }

  _generateMarkup() {
    const {
      results: { length: resultsLength },
      resultsPerPage,
      currentPage,
    } = this._data;

    const numPages = Math.ceil(resultsLength / resultsPerPage);
    this._page = currentPage;

    if (currentPage === 1 && numPages > 1) return this._generateRightButton();

    if (currentPage === numPages && numPages > 1)
      return this._generateLeftButton();

    if (currentPage < numPages)
      return [this._generateLeftButton(), this._generateRightButton()];

    return '';
  }
}

export default new PaginationView();
