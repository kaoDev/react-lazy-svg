import React, {
  FC,
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const spriteSheetId = '__SVG_SPRITE_SHEET__';

const ssrEmptySpriteSheet = `<svg id="${spriteSheetId}" style="display:none"></svg>`;
const svgRegex = /<svg([\s\S]*?)>([\s\S]*?)<\/svg>/gim;
const attributesRegex = /(.*?)=["'](.*?)["']/gim;

export const renderSpriteSheetToString = async (markupString: string) => {
  await Promise.all(Array.from(knownIcons.values()));

  const spriteSheet = renderToStaticMarkup(<SpriteSheet icons={iconsCache} />);

  return markupString.replace(ssrEmptySpriteSheet, spriteSheet);
};

export interface IconData {
  id: string;
  svgString: { __html: string };
  attributes: { [key: string]: string };
}

const noop = () => {};

const spriteContext = createContext<(url: string) => void>(noop);

const mapAttributes = (rawAttributes: string) => {
  let match: null | RegExpExecArray = null;
  const attributes: IconData['attributes'] = {};

  while ((match = attributesRegex.exec(rawAttributes))) {
    const [, name, value] = match;
    attributes[name.trim()] = value;
  }

  return attributes;
};

const mapNodeAttributes = (rawAttributes: NamedNodeMap) =>
  Array.from(rawAttributes).reduce<IconData['attributes']>(
    (attributes, current) => {
      attributes[current.name] = current.value;

      return attributes;
    },
    {}
  );

export const loadSVG = async (url: string) => {
  let svgString: string | null = null;

  if (typeof document !== 'undefined') {
    svgString = await (await fetch(url)).text();
  } else {
    const foo = import('./serverLoadSvg').then(({ readSvg }) => readSvg(url));
    svgString = await foo;
  }

  if (svgString) {
    const matches = svgRegex.exec(svgString);

    if (matches) {
      const [, attributesString, __html] = matches;
      const attributes = mapAttributes(attributesString);

      const svgString = {
        __html,
      };
      const id = url;

      return { id, svgString, attributes };
    }
  }

  if (knownIcons.has(url)) {
    knownIcons.delete(url);
  }

  return null;
};

const knownIcons: Map<string, Promise<IconData | null>> = new Map();

const registeredListeners: Set<(icons: IconData[]) => void> = new Set();
let iconsCache: IconData[] = [];

const addListener = (listener: (icons: IconData[]) => void) => {
  registeredListeners.add(listener);
  listener(iconsCache);
};

const addIcon = (icon: IconData) => {
  iconsCache = [...iconsCache, icon];
  for (const listener of registeredListeners) {
    listener(iconsCache);
  }
};

const registerIcon = async (url: string) => {
  if (knownIcons.has(url)) {
    return;
  }
  const iconPromise = loadSVG(url).then(icon => {
    if (icon) {
      addIcon(icon);
    }
    return icon;
  });
  knownIcons.set(url, iconPromise);
};

const useIcons = () => {
  const [icons, setIcons] = useState<IconData[]>([]);

  useEffect(() => {
    addListener(setIcons);

    return () => {
      registeredListeners.delete(setIcons);
    };
  }, []);

  return icons;
};

export const SpriteContextProvider: FC = ({ children }) => {
  const icons = useIcons();

  return (
    <spriteContext.Provider value={registerIcon}>
      <SpriteSheet icons={icons}></SpriteSheet>
      {children}
    </spriteContext.Provider>
  );
};

export const Icon: FC<{ url: string } & React.SVGProps<SVGSVGElement>> = ({
  url,
  ...props
}) => {
  const registerIcon = useContext(spriteContext);
  registerIcon(url);

  return (
    <svg {...props}>
      <use xlinkHref={`#${url}`} />
    </svg>
  );
};

const hidden = { display: 'none' };
export const SpriteSheet: FC<{ icons: IconData[] }> = ({ icons }) => {
  return (
    <svg id={spriteSheetId} style={hidden}>
      {icons.map(icon => (
        <symbol
          key={icon.id}
          id={icon.id}
          {...icon.attributes}
          dangerouslySetInnerHTML={icon.svgString}
        />
      ))}
    </svg>
  );
};

const initOnClient = () => {
  if (typeof document !== 'undefined') {
    const spriteSheet = document.getElementById(spriteSheetId);

    if (spriteSheet) {
      const sprites = spriteSheet.querySelectorAll('symbol');

      sprites.forEach(node => {
        const { id, attributes: rawAttributes, innerHTML } = node;
        const attributes = mapNodeAttributes(rawAttributes);
        const iconData = { id, attributes, svgString: { __html: innerHTML } };
        addIcon(iconData);

        knownIcons.set(id, new Promise(resolve => resolve(iconData)));
      });
    }
  }
};

initOnClient();
