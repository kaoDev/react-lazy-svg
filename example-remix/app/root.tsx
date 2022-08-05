import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { initOnClient, SpriteContextProvider } from 'react-lazy-svg';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

const isClient = typeof window !== 'undefined';

if (isClient) {
  initOnClient();
}

const loadSVG = async (url: string) => {
  return await (await fetch(url)).text();
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <SpriteContextProvider embeddedSSR loadSVG={loadSVG}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </SpriteContextProvider>
      </body>
    </html>
  );
}
