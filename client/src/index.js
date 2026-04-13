import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

const replaceLocalBackendUrl = (url) => {
  if (typeof url !== 'string') return url;
  return url.replace(/^http:\/\/localhost:5000/i, API_BASE_URL);
};

axios.interceptors.request.use((config) => {
  if (config && config.url) {
    config.url = replaceLocalBackendUrl(config.url);
  }
  return config;
});

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  if (typeof input === 'string') {
    return nativeFetch(replaceLocalBackendUrl(input), init);
  }

  if (input instanceof Request) {
    const replacedUrl = replaceLocalBackendUrl(input.url);
    if (replacedUrl !== input.url) {
      return nativeFetch(new Request(replacedUrl, input), init);
    }
  }

  return nativeFetch(input, init);
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);