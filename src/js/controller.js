import model from './model.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_TIMEOUT } from './config.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

class Controller {
  constructor() {
    bookmarksView.addHandlerRender(this._controlBookmarks);
    recipeView.addHandlerRender(this._controlRecipes);
    recipeView.addHandlerUpdateServings(this._controlServings);
    recipeView.addHandlerAddBookmark(this._controlToggleBookmark);
    searchView.addHandlerSearch(this._controlSearchResults.bind(this));
    paginationView.addHandlerClick(this._controlPagination);
    addRecipeView.addHandlerUpload(this._controlAddRecipe);
  }

  async _controlRecipes() {
    try {
      const id = window.location.hash.slice(1);

      if (!id) return;

      recipeView.renderSpinner();

      resultsView.update(model.getSearchResultsPage());

      await model.loadRecipe(id);

      recipeView.render(model.state.recipe);
      bookmarksView.update(model.state.bookmarks);
    } catch (error) {
      recipeView.renderErrorMessage();
    }
  }

  _controlPagination(page) {
    resultsView.render(model.getSearchResultsPage(page));

    paginationView.render(model.state.search);
  }

  async _controlSearchResults() {
    try {
      const query = searchView.getQueryString();
      if (!query) return;

      await model.loadSearchResults(query);

      this._controlPagination(1);
    } catch (error) {
      resultsView.renderErrorMessage();
    }
  }

  _controlServings(newServings) {
    model.updateServings(newServings);

    recipeView.update(model.state.recipe);
  }

  _controlToggleBookmark() {
    model.toggleBookmark(model.state.recipe);

    recipeView.update(model.state.recipe);

    bookmarksView.render(model.state.bookmarks);
  }

  _controlBookmarks() {
    bookmarksView.render(model.state.bookmarks);
  }

  async _controlAddRecipe(newRecipe) {
    try {
      addRecipeView.renderSpinner();

      await model.uploadRecipe(newRecipe);

      recipeView.render(model.state.recipe);

      addRecipeView.renderMessage();

      window.history.pushState(null, '', `#${model.state.recipe.id}`);

      setTimeout(() => {
        addRecipeView.toggleModal();
        bookmarksView.render(model.state.bookmarks);
        setTimeout(() => {
          addRecipeView.render('Success');
        }, MODAL_CLOSE_TIMEOUT);
      }, MODAL_CLOSE_TIMEOUT);
    } catch (error) {
      addRecipeView.renderErrorMessage();
    }
  }
}

export default new Controller();
