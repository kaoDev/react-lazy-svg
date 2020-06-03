import App from './App';
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
  <SpriteContextProvider knownIcons={cache} loadSVG={loadSVG}>
    <App />
  </SpriteContextProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
