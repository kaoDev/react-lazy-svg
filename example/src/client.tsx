import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { hydrate } from 'react-dom';
import { SpriteContextProvider } from '../../dist';

hydrate(
  <BrowserRouter>
    <SpriteContextProvider>
      <App />
    </SpriteContextProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
