import '../styles/globals.css';
import type { AppProps } from 'next/app';
import {
  IconsCache,
  initOnClient,
  SpriteContextProvider,
} from 'react-lazy-svg';

const cache: IconsCache = new Map();
const loadSVG = async (url: string) => {
  return await (await fetch(url)).text();
};

if (typeof window !== 'undefined') {
  initOnClient(cache);
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SpriteContextProvider embeddedSSR knownIcons={cache} loadSVG={loadSVG}>
      <Component {...pageProps} />
    </SpriteContextProvider>
  );
}

export default MyApp;
