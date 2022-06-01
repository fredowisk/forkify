import icons from 'url:../../img/icons.svg';

class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} responseData
   * @returns
   * @this {Object} View instance
   */

  render(responseData) {
    if (
      !responseData ||
      (Array.isArray(responseData) && responseData.length === 0)
    )
      return this.renderErrorMessage();
    this._data = responseData;
    const markup = this._generateMarkup();
    this._clearView();
    this._insertHTML(markup);
  }

  update(responseData) {
    this._data = responseData;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);

    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const currentElements = Array.from(
      this._parentElement.querySelectorAll('*')
    );

    newElements.forEach((newElement, index) => {
      const currentElement = currentElements[index];
      const isEqualNode = newElement.isEqualNode(currentElement);
      !isEqualNode &&
        newElement.firstChild?.nodeValue.trim() !== '' &&
        (currentElement.textContent = newElement.textContent);

      !isEqualNode &&
        Array.from(newElement.attributes).forEach(attr =>
          currentElement.setAttribute(attr.name, attr.value)
        );
    });
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;

    this._clearView();
    this._insertHTML(markup);
  }

  renderErrorMessage() {
    this._clearView();

    const markup = `
    <div class="error">
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${this._errorMessage}</p>
    </div>
  `;

    this._insertHTML(markup);
  }

  renderMessage() {
    this._clearView();

    const markup = `
    <div class="message">
      <div>
        <svg>
          <use href="${icons}#icon-smile"></use>
        </svg>
      </div>
      <p>${this._message}</p>
    </div>
  `;

    this._insertHTML(markup);
  }

  _insertHTML(markup) {
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _clearView() {
    this._parentElement.innerHTML = '';
  }
}

export default View;
