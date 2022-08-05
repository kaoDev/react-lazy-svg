import type { FC, ReactNode, SVGProps } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { defaultInternalSpriteSheetId, isSSR } from './constants';
import { SpriteSheet } from './SpriteSheet';
import { IconData } from './types';

export { IconData };

const globalIconsCache: IconsCache = new Map();

const noop = () => undefined;

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
  const attributesRegex = /(.*?)=["'](.*?)["']/gim;

  while ((match = attributesRegex.exec(rawAttributes))) {
    const [, name, value] = match;
    if (name && value) {
      attributes[name.trim()] = value;
    }
  }

  return attributes;
};

export type IconsCache = Map<string, IconData | Promise<IconData | undefined>>;

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
  svgString: string | undefined,
): IconData | undefined => {
  if (svgString) {
    const svgRegex = /<svg([\s\S]*?)>([\s\S]*?)<\/svg>/gim;
    const matches = svgRegex.exec(svgString);

    if (matches) {
      const [, attributesString, htmlString] = matches;

      if (!attributesString || !htmlString) {
        return;
      }

      const attributes = mapAttributes(attributesString);

      const svgString = {
        __html: htmlString.trim(),
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
  knownIcons: IconsCache,
) => {
  const iconData = parseSVG(url, svgString);

  if (iconData) {
    if (!isSSR) {
      addIcon(iconData);
    }
  } else if (knownIcons.has(url)) {
    knownIcons.delete(url);
  }
  return iconData;
};

const useIcons = () => {
  const [icons, setIcons] = useState<IconData[]>(localIconsList);

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
  embeddedSSR?: boolean;
  children?: ReactNode;
}

export const SpriteContextProvider: FC<SpriteContext> = ({
  children,
  loadSVG,
  knownIcons = globalIconsCache,
  embeddedSSR = false,
}) => {
  const icons = useIcons();

  const registerSVG = useCallback(
    (url: string) => {
      if (knownIcons.has(url)) {
        return;
      }
      const iconPromise = loadSVG(url).then((svgString) =>
        registerIconInCache(url, svgString, knownIcons),
      );
      knownIcons.set(url, iconPromise);
    },
    [knownIcons, loadSVG],
  );

  const { registerSVG: wrappingContextRegisterSVG } = useContext(spriteContext);
  const contextValue = useMemo(
    () => ({
      registerSVG:
        wrappingContextRegisterSVG === noop
          ? registerSVG
          : wrappingContextRegisterSVG,
    }),
    [registerSVG, wrappingContextRegisterSVG],
  );

  return (
    <spriteContext.Provider value={contextValue}>
      {children}
      {(!isSSR || embeddedSSR) && (
        <SpriteSheet embeddedSSR={embeddedSSR} icons={icons}></SpriteSheet>
      )}
    </spriteContext.Provider>
  );
};

export const Icon: FC<{ url: string } & SVGProps<SVGSVGElement>> = ({
  url,
  ...props
}) => {
  const { registerSVG } = useContext(spriteContext);

  if (isSSR) {
    registerSVG(url);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      registerSVG(url);
    }, [registerSVG, url]);
  }

  return (
    <svg {...props}>
      <use xlinkHref={`#${url}`} />
    </svg>
  );
};

const mapNodeAttributes = (rawAttributes: NamedNodeMap) =>
  Array.from(rawAttributes).reduce<IconData['attributes']>(
    (attributes, current) => {
      attributes[current.name] = current.value;

      return attributes;
    },
    {},
  );

export const initOnClient = (
  knownIcons: IconsCache = globalIconsCache,
  spriteSheetId = defaultInternalSpriteSheetId,
) => {
  knownIcons.clear();
  const spriteSheet = document.getElementById(spriteSheetId);

  if (spriteSheet) {
    const sprites = Array.from(spriteSheet.querySelectorAll('symbol'));

    for (const node of sprites) {
      const innerHTML = node.innerHTML;
      const { id, attributes: rawAttributes } = node;
      const attributes = mapNodeAttributes(rawAttributes);
      const iconData = {
        id,
        attributes,
        svgString: { __html: innerHTML.trim() },
      };
      addIcon(iconData);

      knownIcons.set(id, new Promise((resolve) => resolve(iconData)));
    }
  }
};
