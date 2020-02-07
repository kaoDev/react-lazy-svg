import React, {
  FC,
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const spriteSheetId = '__SVG_SPRITE_SHEET__';

const ssrEmptySpriteSheet = `<svg id="${spriteSheetId}" style="display:none"></svg>`;
const svgRegex = /<svg([\s\S]*?)>([\s\S]*?)<\/svg>/gim;
const attributesRegex = /(.*?)=["'](.*?)["']/gim;

const globalIconsCache: IconsCache = new Map();

export const renderSpriteSheetToString = async (
  markupString: string,
  knownIcons: IconsCache
) => {
  const arr = await Promise.all(Array.from(knownIcons.values()));

  const spriteSheet = renderToStaticMarkup(
    <SpriteSheet icons={arr.filter((a): a is IconData => a != null)} />
  );

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

export type IconsCache = Map<string, Promise<IconData | undefined>>;

let localIconsList: IconData[] = [];

const registeredListeners: Set<(icons: IconData[]) => void> = new Set();

const addListener = (listener: (icons: IconData[]) => void) => {
  registeredListeners.add(listener);
  listener(localIconsList);
};

const addIcon = (icon: IconData) => {
  localIconsList = [...localIconsList, icon];
  for (const listener of registeredListeners) {
    listener(localIconsList);
  }
};

const parseSVG = (
  url: string,
  svgString: string | undefined
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

  return undefined;
};

const registerIconInCache = (
  url: string,
  svgString: string | undefined,
  knownIcons: IconsCache
) => {
  const iconData = parseSVG(url, svgString);

  if (iconData) {
    addIcon(iconData);
  } else if (knownIcons.has(url)) {
    knownIcons.delete(url);
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
  loadSVG: (url: string) => Promise<string | undefined>;
  knownIcons?: IconsCache;
}

export const SpriteContextProvider: FC<SpriteContext> = ({
  children,
  loadSVG,
  knownIcons = globalIconsCache,
}) => {
  const icons = useIcons();

  const registerSVG = useCallback(
    (url: string) => {
      if (knownIcons.has(url)) {
        return;
      }
      const iconPromise = loadSVG(url).then(svgString =>
        registerIconInCache(url, svgString, knownIcons)
      );
      knownIcons.set(url, iconPromise);
    },
    [knownIcons]
  );

  const contextValue = useMemo(() => ({ registerSVG }), [registerSVG]);

  return (
    <spriteContext.Provider value={contextValue}>
      {children}
      <SpriteSheet icons={icons}></SpriteSheet>
    </spriteContext.Provider>
  );
};

export const Icon: FC<{ url: string } & React.SVGProps<SVGSVGElement>> = ({
  url,
  ...props
}) => {
  const { registerSVG } = useContext(spriteContext);
  registerSVG(url);

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
        ({
          id,
          svgString,
          attributes: {
            width,
            height,
            ['xmlns:xlink']: xmlnsXlink,
            ...attributes
          },
        }) => {
          return (
            <symbol
              key={id}
              id={id}
              xmlnsXlink={xmlnsXlink}
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

export const initOnClient = (knownIcons: IconsCache = globalIconsCache) => {
  knownIcons.clear();
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
};
