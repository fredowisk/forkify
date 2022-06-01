import { async } from 'regenerator-runtime';
import { makeGETRequest, makePOSTRequest } from './helpers.js';
import { API_KEY, RESULTS_PER_PAGE } from './config.js';

const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    currentPage: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const {
    data: {
      recipe: {
        source_url: sourceUrl,
        image_url: imageUrl,
        cooking_time: cookingTime,
        ...rest
      },
    },
  } = data;

  state.recipe = {
    sourceUrl,
    imageUrl,
    cookingTime,
    ...rest,
  };
};

const loadRecipe = async function (id) {
  try {
    const data = await makeGETRequest(`${id}?key=${API_KEY}`);

    createRecipeObject(data);

    state.bookmarks.some(bookmark => bookmark.id === id) &&
      (state.recipe.bookmarked = true);
  } catch (error) {
    throw error;
  }
};

const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const {
      data: { recipes },
    } = await makeGETRequest(`?search=${query}&key=${API_KEY}`);

    state.search.results = recipes.map(({ image_url: imageUrl, ...rest }) => ({
      imageUrl,
      ...rest,
    }));
  } catch (error) {
    throw error;
  }
};

const getSearchResultsPage = function (page = state.search.currentPage) {
  state.search.currentPage = page;
  const { results, resultsPerPage } = state.search;
  const start = (page - 1) * resultsPerPage;
  const end = page * resultsPerPage;

  return results.slice(start, end);
};

const updateServings = function (newServings) {
  const { ingredients, servings } = state.recipe;
  ingredients.forEach(
    ingredient =>
      (ingredient.quantity =
        ((ingredient.quantity || 0) * newServings) / servings)
  );

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

const toggleBookmark = function (recipe) {
  if (recipe.id !== state.recipe.id) return;

  const isBookmarked = state.recipe.bookmarked;
  state.recipe.bookmarked = !isBookmarked;

  if (!isBookmarked) state.bookmarks.push(recipe);
  else {
    const index = state.bookmarks.findIndex(({ id }) => id === recipe.id);
    state.bookmarks.splice(index, 1);
  }

  persistBookmarks();
};

const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(key => key[0].startsWith('ingredient') && key[1])
      .map(ingredient => {
        const [quantity, unit, description] = ingredient[1]
          .split(',')
          .map(item => item.trim());

        if (!description) throw new Error();

        return {
          quantity: Number(quantity) || null,
          unit,
          description,
        };
      });

    const { title, sourceUrl, imageUrl, publisher, cookingTime, servings } =
      newRecipe;

    const recipe = {
      title,
      source_url: sourceUrl,
      image_url: imageUrl,
      publisher,
      cooking_time: Number(cookingTime),
      servings: Number(servings),
      ingredients,
    };

    const data = await makePOSTRequest(recipe);

    createRecipeObject(data);

    toggleBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (!storage) return;

  state.bookmarks = JSON.parse(storage);
};

init();

// const clearBookmarks = function() {
//   localStorage.clear('bookmarks');
// }

// clearBookmarks();

export {
  state,
  loadRecipe,
  loadSearchResults,
  getSearchResultsPage,
  updateServings,
  toggleBookmark,
  persistBookmarks,
  uploadRecipe,
};
