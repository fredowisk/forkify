import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query. Please try again!';
  _hashId;

  _generateMarkup() {
    this._hashId = window.location.hash.slice(1);
    return this._data.map(previewView._generateMarkup.bind(this)).join('');
  }
}

export default new ResultsView();
