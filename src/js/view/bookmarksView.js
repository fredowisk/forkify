import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it! 😉';
  _hashId;

  addHandlerRender(handlerFunction) {
    window.addEventListener('load', handlerFunction);
  }

  _generateMarkup() {
    this._hashId = window.location.hash.slice(1);
    return this._data.map(previewView._generateMarkup.bind(this)).join('');
  }
}

export default new BookmarksView();
