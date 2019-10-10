export const readSvg = async (url: string) => {
  console.log('ELIHAEOPGHAEPOGIHAPEOGIHAPEOIGH');
  const fs = require('fs');
  const { promisify } = require('util');

  const readFile = promisify(fs.readFile);
  // ignore external assets on server side
  if (!url.startsWith('http')) {
    return readFile(url, { encoding: 'utf8' });
  }
  return null;
};
