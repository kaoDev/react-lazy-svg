import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { defaultInternalSpriteSheetId, isSSR } from './constants';
import { IconData } from './types';

const hidden = {
  height: 0,
  width: 0,
  position: 'absolute',
  visibility: 'hidden',
} as const;

export function SpriteSheet({
  icons,
  spriteSheetId = defaultInternalSpriteSheetId,
  embeddedSSR,
}: {
  icons: IconData[];
  spriteSheetId?: string;
  embeddedSSR?: boolean;
}) {
  const spriteSheetContainer = useRef(
    !isSSR && !embeddedSSR ? document.getElementById(spriteSheetId) : null,
  );

  const renderedIcons = icons.map(
    ({
      id,
      svgString,
      attributes: { width, height, ['xmlns:xlink']: xmlnsXlink, ...attributes },
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
    },
  );

  if (spriteSheetContainer.current) {
    return createPortal(renderedIcons, spriteSheetContainer.current);
  }

  return (
    <svg id={spriteSheetId} style={hidden}>
      {renderedIcons}
    </svg>
  );
}
