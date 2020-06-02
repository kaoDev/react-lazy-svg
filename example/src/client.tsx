import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { hydrate } from 'react-dom';
import {
  SpriteContextProvider,
  initOnClient,
  IconsCache,
} from 'react-lazy-svg';

const cache: IconsCache = new Map();
const loadSVG = async (url: string) => {
  return await (await fetch(url)).text();
};
initOnClient(cache);

hydrate(
  <BrowserRouter>
    <SpriteContextProvider knownIcons={cache} loadSVG={loadSVG}>
      <App />
    </SpriteContextProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
