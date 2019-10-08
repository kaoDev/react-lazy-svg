import { renderSpriteSheetToString } from '../dist';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { Root } from './Root';
import { readFileSync } from 'fs';

import express from 'express';
const app = express();

const staticIndexHtml = readFileSync('./dist/index.html', { encoding: 'utf8' });

const port = 3000;

app.get('/', async (_req, res) => {
  const appString = renderToString(<Root />);
  const extended = await renderSpriteSheetToString(appString);

  res.send(
    staticIndexHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${extended}</div>`
    )
  );
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
