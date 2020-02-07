import App from './App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import fastify from 'fastify';
import { renderToString } from 'react-dom/server';
import fastifyStatic from 'fastify-static';
import {
  renderSpriteSheetToString,
  SpriteContextProvider,
  IconsCache,
} from 'react-lazy-svg';
import { readSvg } from './serverLoadSvg';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);

const server = fastify({ logger: true });

server.register(fastifyStatic, {
  root: process.env.RAZZLE_PUBLIC_DIR!,
  prefix: '/static', // optional: default '/'
});

server.get('/*', async (req, res) => {
  const sessionIcons: IconsCache = new Map();
  const context: { url?: string } = {};
  const markup = renderToString(
    <StaticRouter context={context} location={req.raw.url}>
      <SpriteContextProvider loadSVG={readSvg} knownIcons={sessionIcons}>
        <App />
      </SpriteContextProvider>
    </StaticRouter>
  );

  if (context.url) {
    res.redirect(context.url);
  } else {
    const renderedHtml = `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
        ${
          process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body>
        <div id="root">${markup}</div>
    </body>
</html>`;

    const extended = await renderSpriteSheetToString(
      renderedHtml,
      sessionIcons
    );

    res
      .type('text/html')
      .status(200)
      .send(extended);
  }
});

export default server;
