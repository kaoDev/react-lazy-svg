import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const svgIconFiles = new Map<string, string>();
const readFile = promisify(fs.readFile);
const baseUrl = '/build/_assets';

export const readSvg = async (url: string) => {
  if (svgIconFiles.has(url)) {
    return svgIconFiles.get(url);
  }

  if (url.startsWith(baseUrl)) {
    const filePath = path.join(
      __dirname,
      '..',
      'public',
      'build',
      '_assets',
      url.substring(baseUrl.length),
    );
    const fileContents = await readFile(filePath, 'utf8');
    svgIconFiles.set(url, fileContents);
    return fileContents;
  }

  return undefined;
};
