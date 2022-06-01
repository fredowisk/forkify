import { API_URL, TIMEOUT_SECONDS, API_KEY } from './config.js';

class Helpers {
  _timeout(seconds) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(
          new Error(`Request took too long! Timeout after ${seconds} second`)
        );
      }, seconds * 1000);
    });
  }

  async _AJAX(url, options) {
    try {
      const response = await Promise.race([
        fetch(url, options),
        this._timeout(TIMEOUT_SECONDS),
      ]);

      const data = await response.json();

      if (!response.ok) throw new Error(`${data.message} ${response.status}`);

      return data;
    } catch (error) {
      throw error;
    }
  }

  async makeGETRequest(query) {
    try {
      return this._AJAX(`${API_URL}${query}`, {});
    } catch (error) {
      throw error;
    }
  }

  async makePOSTRequest(uploadData) {
    try {
      return this._AJAX(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new Helpers();
