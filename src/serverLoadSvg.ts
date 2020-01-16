export const readSvg = async (url: string) => {
  const fs = require('fs');
  const { promisify } = require('util');
  const path = require('path');

  const readFile = promisify(fs.readFile);

  const cdnBase = 'http://localhost:3001/static/media/';

  if (url.startsWith(cdnBase)) {
    url = path.join(
      process.cwd(),
      url.replace(cdnBase, './build/static/media/')
    );
  }

  // ignore external assets on server side
  if (!url.startsWith('http')) {
    return readFile(url, { encoding: 'utf8' });
  }
  return null;
};
