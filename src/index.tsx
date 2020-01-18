import React, {
  FC,
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
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

const noop = () => void 0;

interface SpriteContextValue {
  /**
   * triggers loading of the svg if necessary and registers it in the local cache
   */
  registerSVG: (url: string) => void;
}

const spriteContext = createContext<SpriteContextValue>({ registerSVG: noop });

const mapAttributes = (rawAttributes: string) => {
  let match: null | RegExpExecArray = null;
  const attributes: IconData['attributes'] = {};

  while ((match = attributesRegex.exec(rawAttributes))) {
    const [, name, value] = match;
    attributes[name.trim()] = value;
  }

  return attributes;
};

type IconsCache = Map<string, Promise<IconData | undefined>>;

// const knownIcons: Map<string, Promise<IconData | undefined>> = new Map();

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

const storeSVG = (
  url: string,
  svgString: string | undefined,
  knownIcons: IconsCache
): IconData | undefined => {
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

  return undefined;
};

const registerIconInCache = (
  url: string,
  svgString: string | undefined,
  knownIcons: IconsCache
) => {
  if (knownIcons.hasOwnProperty(url)) {
    return;
  }
  const iconData = storeSVG(url, svgString, knownIcons);
  if (iconData) {
    addIcon(iconData);
  }
  return iconData;
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

export interface SpriteContext {
  /**
   * asynchronous function to load an svg string by url
   */
  loadSVG: (url: string) => Promise<string>;
}

const;

export const SpriteContextProvider: FC<SpriteContext> = ({
  children,
  loadSVG,
}) => {
  const icons = useIcons();

  knownIcons.set(url, iconPromise);
  const [setKnownIcons, knownIcons] = useState<IconsCache>({});

  const registerIcon = useCallback((url: string) => {
    loadSVG(url).then();
  }, []);

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
      {icons.map(
        ({ id, svgString, attributes: { width, height, ...attributes } }) => {
          return (
            <symbol
              key={id}
              id={id}
              {...attributes}
              dangerouslySetInnerHTML={svgString}
            />
          );
        }
      )}
    </svg>
  );
};

const mapNodeAttributes = (rawAttributes: NamedNodeMap) =>
  Array.from(rawAttributes).reduce<IconData['attributes']>(
    (attributes, current) => {
      attributes[current.name] = current.value;

      return attributes;
    },
    {}
  );

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
