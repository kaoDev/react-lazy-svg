import React from 'react';
import { SpriteContextProvider, Icon } from '../dist';

export const Root = () => {
  return (
    <SpriteContextProvider>
      <Icon url={'http://localhost:5000/accessibility-24px.2af103a1.svg'} />
    </SpriteContextProvider>
  );
};
