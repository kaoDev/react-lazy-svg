import App from './App';
import React from 'react';
import fastify from 'fastify';
import { renderToString } from 'react-dom/server';
import fastifyStatic from 'fastify-static';
import { SpriteContextProvider, IconsCache } from 'react-lazy-svg';
import { createSpriteSheetString } from 'react-lazy-svg/dist/ssr';
import { readSvg } from './serverLoadSvg';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);

const server = fastify({ logger: true });

server.register(fastifyStatic, {
  root: process.env.RAZZLE_PUBLIC_DIR!,
  prefix: '/static', // optional: default '/'
});

server.get('/*', async (_, res) => {
  const sessionIcons: IconsCache = new Map();
  const context: { url?: string } = {};
  const markup = renderToString(
    <SpriteContextProvider loadSVG={readSvg} knownIcons={sessionIcons}>
      <App />
    </SpriteContextProvider>,
  );

  const spriteSheet = await createSpriteSheetString(sessionIcons);

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
        ${spriteSheet}
    </body>
</html>`;

    res.type('text/html').status(200).send(renderedHtml);
  }
});

export default server;
