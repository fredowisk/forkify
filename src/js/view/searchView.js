import View from './View.js';
import icons from 'url:../../img/icons.svg';

class SearchView extends View {
  _parentElement = document.querySelector('.search');
  _searchInput = this._parentElement.querySelector('.search__field');

  getQueryString() {
    return this._searchInput.value;
  }

  addHandlerSearch(handlerFunction) {
    this._parentElement.addEventListener('submit', e => {
      e.preventDefault();
      handlerFunction();
      this._clearInput();
    });
  }

  _clearInput() {
    this._searchInput.value = '';
  }
}

export default new SearchView();
