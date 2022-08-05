import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const svgIconFiles = new Map<string, string>();
const readFile = promisify(fs.readFile);
const baseUrl = '/_next/static/media';

export const readSvg = async (url: string) => {
  if (svgIconFiles.has(url)) {
    return svgIconFiles.get(url);
  }

  if (url.startsWith(baseUrl)) {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'static',
      'media',
      url.substring(baseUrl.length),
    );
    const fileContents = await readFile(filePath, 'utf8');

    svgIconFiles.set(url, fileContents);
    return fileContents;
  }

  return undefined;
};
