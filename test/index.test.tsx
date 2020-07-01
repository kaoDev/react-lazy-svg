import React from 'react';
import { render } from '@testing-library/react';
import {
  Icon,
  SpriteContextProvider,
  IconsCache,
  initOnClient,
} from '../src/index';
import { act } from 'react-dom/test-utils';

const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
<path d="M0 0h24v24H0z" fill="none"/>
</svg>`;
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
<path d="M0 0h24v24H0z" fill="none"/>
</svg>`;

const loadSVG = async (url: string) => {
  switch (url) {
    case '1': {
      return svg1;
    }
    case '2':
    default:
      return svg2;
  }
};

test('should fill the cache when an icon is rendered', async () => {
  const cache: IconsCache = new Map();
  const { rerender } = render(
    <SpriteContextProvider knownIcons={cache} loadSVG={loadSVG}>
      <Icon url={'1'}></Icon>
    </SpriteContextProvider>,
  );
  expect(cache.size).toBe(1);
  await act(async () => {
    const iconData = await cache.get('1');

    expect(iconData?.attributes.viewBox).toBe('0 0 24 24');
    expect(iconData?.svgString.__html).toBe(
      '<path d="M0 0h24v24H0z" fill="none"/>',
    );
  });

  rerender(
    <SpriteContextProvider knownIcons={cache} loadSVG={loadSVG}>
      <Icon url={'2'}></Icon>
    </SpriteContextProvider>,
  );
  await act(async () => {
    expect(cache.size).toBe(2);
    const iconData = await cache.get('2');
    expect(iconData?.attributes.viewBox).toBe('0 0 24 24');
    expect(iconData?.svgString.__html).toBe(
      '<path d="M0 0h24v24H0z" fill="none"/>',
    );
  });
});

test('client should be able to initiate the cache from a rendered dom', async () => {
  const serialize = require('w3c-xmlserializer');

  window.XMLSerializer = class XMLSerializer {
    serializeToString = serialize;
  };

  const cache: IconsCache = new Map();
  document.body.innerHTML = `<svg id="__SVG_SPRITE_SHEET__" style="display:none">
      <symbol
        id="1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
      </symbol>
    </svg>`;

  initOnClient(cache);

  expect(cache.size).toBe(1);
  const iconData = await cache.get('1');

  expect(iconData?.id).toBe('1');
  expect(iconData?.attributes.height).toBe(undefined);
  expect(iconData?.attributes.width).toBe(undefined);
  expect(iconData?.attributes.viewBox).toBe('0 0 24 24');
  expect(iconData?.svgString.__html).toBe(
    '<path xmlns="http://www.w3.org/2000/svg" d="M0 0h24v24H0z" fill="none"/>',
  );
});
