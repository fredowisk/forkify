import { async } from 'regenerator-runtime';
import helpers from './helpers.js';
import { API_KEY, RESULTS_PER_PAGE } from './config.js';

class Model {
  _data;
  state = {
    recipe: {},
    search: {
      query: '',
      results: [],
      resultsPerPage: RESULTS_PER_PAGE,
      currentPage: 1,
    },
    bookmarks: [],
  };

  constructor() {
    this._getStorage();
  }

  _getStorage() {
    const storage = localStorage.getItem('bookmarks');
    if (!storage) return;

    this.state.bookmarks = JSON.parse(storage);
  }

  _persistBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(this.state.bookmarks));
  }

  _createRecipeObject() {
    const {
      data: {
        recipe: {
          source_url: sourceUrl,
          image_url: imageUrl,
          cooking_time: cookingTime,
          ...rest
        },
      },
    } = this._data;

    this.state.recipe = {
      sourceUrl,
      imageUrl,
      cookingTime,
      ...rest,
    };
  }

  async loadRecipe(id) {
    try {
      this._data = await helpers.makeGETRequest(`${id}?key=${API_KEY}`);

      this._createRecipeObject();

      this.state.bookmarks.some(bookmark => bookmark.id === id) &&
        (this.state.recipe.bookmarked = true);
    } catch (error) {
      throw error;
    }
  }

  async loadSearchResults(query) {
    try {
      this.state.search.query = query;
      const {
        data: { recipes },
      } = await helpers.makeGETRequest(`?search=${query}&key=${API_KEY}`);

      this.state.search.results = recipes.map(
        ({ image_url: imageUrl, ...rest }) => ({
          imageUrl,
          ...rest,
        })
      );
    } catch (error) {
      throw error;
    }
  }

  getSearchResultsPage(page = this.state.search.currentPage) {
    this.state.search.currentPage = page;
    const { results, resultsPerPage } = this.state.search;
    const start = (page - 1) * resultsPerPage;
    const end = page * resultsPerPage;

    return results.slice(start, end);
  }

  updateServings(newServings) {
    const { ingredients, servings } = this.state.recipe;
    ingredients.forEach(
      ingredient =>
        (ingredient.quantity =
          ((ingredient.quantity || 0) * newServings) / servings)
    );

    this.state.recipe.servings = newServings;
  }

  toggleBookmark(recipe) {
    if (recipe.id !== this.state.recipe.id) return;

    const isBookmarked = this.state.recipe.bookmarked;
    this.state.recipe.bookmarked = !isBookmarked;

    if (!isBookmarked) this.state.bookmarks.push(recipe);
    else {
      const index = this.state.bookmarks.findIndex(
        ({ id }) => id === recipe.id
      );
      this.state.bookmarks.splice(index, 1);
    }

    this._persistBookmarks();
  }

  async uploadRecipe(newRecipe) {
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

      this._data = await helpers.makePOSTRequest(recipe);

      this._createRecipeObject();

      this.toggleBookmark(this.state.recipe);
    } catch (error) {
      throw error;
    }
  }
}

export default new Model();
