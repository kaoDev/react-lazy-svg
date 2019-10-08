import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export const readSvg = async (url: string) => {
  // ignore external assets on server side
  if (!url.startsWith('http')) {
    return await readFile(url, { encoding: 'utf8' });
  }
  return null;
};
