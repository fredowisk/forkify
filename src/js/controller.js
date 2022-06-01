import {
  state,
  loadRecipe,
  loadSearchResults,
  getSearchResultsPage,
  updateServings,
  toggleBookmark,
  persistBookmarks,
  uploadRecipe,
} from './model.js';
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
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    resultsView.update(getSearchResultsPage());

    await loadRecipe(id);

    recipeView.render(state.recipe);
    bookmarksView.update(state.bookmarks);
  } catch (error) {
    recipeView.renderErrorMessage();
  }
};

const controlPagination = function (page) {
  resultsView.render(getSearchResultsPage(page));

  paginationView.render(state.search);
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQueryString();
    if (!query) return;

    await loadSearchResults(query);

    controlPagination(1);
  } catch (error) {
    resultsView.renderErrorMessage();
  }
};

const controlServings = function (newServings) {
  updateServings(newServings);

  recipeView.update(state.recipe);
};

const controlToggleBookmark = function () {
  toggleBookmark(state.recipe);

  recipeView.update(state.recipe);

  bookmarksView.render(state.bookmarks);
  persistBookmarks();
};

const controlBookmarks = function () {
  bookmarksView.render(state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await uploadRecipe(newRecipe);

    recipeView.render(state.recipe);

    addRecipeView.renderMessage();

    window.history.pushState(null, '', `#${state.recipe.id}`);

    setTimeout(() => {
      addRecipeView.toggleModal();
      bookmarksView.render(state.bookmarks);
      setTimeout(() => {
        addRecipeView.render('Success');
      }, MODAL_CLOSE_TIMEOUT);
    }, MODAL_CLOSE_TIMEOUT);
  } catch (error) {
    addRecipeView.renderErrorMessage();
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlToggleBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  // bookmarksView.render(state.bookmarks);
};

init();
