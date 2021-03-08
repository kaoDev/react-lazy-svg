import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IconData, IconsCache, SpriteSheet } from './index';
import { defaultInternalSpriteSheetId } from './constants';

export const createSpriteSheetString = (knownIcons: IconsCache) => {
  return Promise.all(Array.from(knownIcons.values())).then((icons) =>
    renderToStaticMarkup(
      <SpriteSheet icons={icons.filter((a): a is IconData => a != null)} />,
    ),
  );
};

export const renderSpriteSheetToString = (
  markupString: string,
  knownIcons: IconsCache,
  spriteSheetId = defaultInternalSpriteSheetId,
) => {
  return createSpriteSheetString(knownIcons).then((spriteSheet) => {
    const ssrEmptySpriteSheet = `<svg id="${spriteSheetId}" style="display:none"></svg>`;
    return markupString.replace(ssrEmptySpriteSheet, spriteSheet);
  });
};
