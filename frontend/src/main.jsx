import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './app/store.js';
import { refreshToken } from './store/slices/authSlice';
import './index.css';
// Check for refresh token on app start
store.dispatch(refreshToken());

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>,
);