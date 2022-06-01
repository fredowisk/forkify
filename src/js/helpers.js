import { API_URL, TIMEOUT_SECONDS, API_KEY } from './config.js';

const timeout = function (seconds) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new Error(`Request took too long! Timeout after ${seconds} second`)
      );
    }, seconds * 1000);
  });
};

const AJAX = async function (url, options) {
  try {
    const response = await Promise.race([
      fetch(url, options),
      timeout(TIMEOUT_SECONDS),
    ]);

    const data = await response.json();

    if (!response.ok) throw new Error(`${data.message} ${response.status}`);

    return data;
  } catch (error) {
    throw error;
  }
};

const makeGETRequest = async function (query) {
  try {
    return AJAX(`${API_URL}${query}`, {});
  } catch (error) {
    throw error;
  }
};

const makePOSTRequest = async function (uploadData) {
  try {
    return AJAX(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });
  } catch (error) {
    throw error;
  }
};

export { makeGETRequest, makePOSTRequest };
