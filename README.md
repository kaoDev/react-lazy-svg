<p align="center"><img alt="sloth emoji" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/271/sloth_1f9a5.png" /></p>

<h1 align="center">react-lazy-svg</h1>
<p align="center" style="font-size: 1.2rem;">The easy way to use SVG sprite-sheets</p>

[![GitHub license](https://img.shields.io/github/license/kaoDev/react-lazy-svg?style=flat-square)](https://github.com/kaoDev/react-lazy-svg)
[![npm](https://img.shields.io/npm/dm/react-lazy-svg?style=flat-square)](https://www.npmjs.com/package/react-lazy-svg)
[![npm](https://img.shields.io/npm/v/react-lazy-svg?style=flat-square)](https://www.npmjs.com/package/react-lazy-svg)
[![GitHub issues](https://img.shields.io/github/issues/kaoDev/react-lazy-svg?style=flat-square)](https://github.com/kaoDev/react-lazy-svg/issues)

react-lazy-svg is a simple way to use SVGs with the performance benefits of a
sprite-sheet and svg css styling possibilities. Without bloating the bundle. It
automatically creates a sprite-sheet for all used SVGs on the client but also
provides a function to create a server side rendered sprite-sheet for icons used
in the first paint.

## Usage

```bash
npm install --save react-lazy-svg
```

Wrap the App with the contextProvider and provide a function to resolve SVG
strings by URL. If you are using server side rendering you should also call
`initOnClient()` to hydrate the sprite sheet context.

```tsx
import { SpriteContextProvider, initOnClient. Icon } from 'react-lazy-svg';
import icon1 from './icon1.svg';

const loadSVG = async (url: string) => {
  return await (await fetch(url)).text();
};
initOnClient();

const Root = () => (
  <SpriteContextProvider loadSVG={loadSVG}>
    <Icon url={icon1} className="icon"></Icon>
    <Icon url={icon1} className="icon red"></Icon>
  </SpriteContextProvider>
);
```

On the server the SVG resolver function could look like this, and load the svg
contents from the file system.

```ts
const svgIconFiles = new Map<string, string>();
export const readSvg = async (url: string) => {
  if (svgIconFiles.has(url)) {
    return svgIconFiles.get(url);
  }

  const readFile = promisify(fs.readFile);

  const cdnBase = 'http://localhost:3001/static/media/';

  if (url.startsWith(cdnBase)) {
    url = path.join(
      process.cwd(),
      url.replace(cdnBase, './build/public/static/media/'),
    );
  }

  // ignore external assets on server side
  if (!url.startsWith('http')) {
    const svgString = await readFile(url, { encoding: 'utf8' });
    svgIconFiles.set(url, svgString);
    return svgString;
  }

  return undefined;
};
```
