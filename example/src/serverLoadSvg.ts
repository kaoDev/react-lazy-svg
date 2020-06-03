import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

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
      url.replace(cdnBase, './build/public/static/media/')
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
