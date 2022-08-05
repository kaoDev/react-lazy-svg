import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { IconsCache, SpriteContextProvider } from 'react-lazy-svg';
import { renderSpriteSheetToString } from 'react-lazy-svg/dist/ssr';
import { readSvg } from './serverLoadSvg';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const sessionIcons: IconsCache = new Map();

  remixContext.appState;

  const markup = renderToString(
    <SpriteContextProvider loadSVG={readSvg} knownIcons={sessionIcons}>
      <RemixServer context={remixContext} url={request.url} />
    </SpriteContextProvider>,
  );

  const extendedMarkup = await renderSpriteSheetToString(markup, sessionIcons);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + extendedMarkup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
