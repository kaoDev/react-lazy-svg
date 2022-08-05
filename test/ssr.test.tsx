/**
 * @jest-environment node
 */
import React from 'react';
import { Icon, SpriteContextProvider, IconsCache } from '../src/index';
import { renderSpriteSheetToString, createSpriteSheetString } from '../src/ssr';
import { renderToString } from 'react-dom/server';

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

test('render loaded svgs to a svg sprite sheet string', async () => {
  const cache: IconsCache = new Map();
  const renderedString = renderToString(
    <SpriteContextProvider embeddedSSR knownIcons={cache} loadSVG={loadSVG}>
      <Icon url={'1'}></Icon>
    </SpriteContextProvider>,
  );

  const renderedSpriteSheet = await renderSpriteSheetToString(
    renderedString,
    cache,
  );

  expect(renderedSpriteSheet).toMatchInlineSnapshot(
    `"<svg><use xlink:href=\\"#1\\"></use></svg><svg id=\\"__SVG_SPRITE_SHEET__\\" style=\\"height:0;width:0;position:absolute;visibility:hidden\\"><symbol id=\\"1\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\"><path d=\\"M0 0h24v24H0z\\" fill=\\"none\\"/></symbol></svg>"`,
  );
});

test('should not render an embedded sprite sheet when not explicitly asked for', async () => {
  const cache: IconsCache = new Map();
  const renderedString = renderToString(
    <SpriteContextProvider knownIcons={cache} loadSVG={loadSVG}>
      <Icon url={'1'}></Icon>
    </SpriteContextProvider>,
  );

  const renderedSpriteSheet = await renderSpriteSheetToString(
    renderedString,
    cache,
  );

  expect(renderedSpriteSheet).toMatchInlineSnapshot(
    `"<svg><use xlink:href=\\"#1\\"></use></svg>"`,
  );
});

test('render loaded svgs to a svg sprite sheet string', async () => {
  const cache: IconsCache = new Map();
  renderToString(
    <SpriteContextProvider embeddedSSR knownIcons={cache} loadSVG={loadSVG}>
      <Icon url={'1'}></Icon>
    </SpriteContextProvider>,
  );

  const renderedSpriteSheet = await createSpriteSheetString(cache);

  expect(renderedSpriteSheet).toMatchInlineSnapshot(
    `"<svg id=\\"__SVG_SPRITE_SHEET__\\" style=\\"height:0;width:0;position:absolute;visibility:hidden\\"><symbol id=\\"1\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\"><path d=\\"M0 0h24v24H0z\\" fill=\\"none\\"/></symbol></svg>"`,
  );
});
