import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { defaultInternalSpriteSheetId } from './constants';
import { IconsCache } from './index';
import { SpriteSheet } from './SpriteSheet';
import { IconData } from './types';

export const createSpriteSheetString = (knownIcons: IconsCache) => {
  return Promise.all(Array.from(knownIcons.values())).then((icons) =>
    renderToStaticMarkup(
      <SpriteSheet icons={icons.filter((a): a is IconData => a != null)} />,
    ),
  );
};

const emptyIconsCache: IconData[] = [];

export const renderSpriteSheetToString = (
  markupString: string,
  knownIcons: IconsCache,
  spriteSheetId = defaultInternalSpriteSheetId,
) => {
  return createSpriteSheetString(knownIcons).then((spriteSheet) => {
    const ssrEmptySpriteSheet = renderToString(
      <SpriteSheet icons={emptyIconsCache} spriteSheetId={spriteSheetId} />,
    );
    return markupString.replace(ssrEmptySpriteSheet, spriteSheet);
  });
};
