import { useState } from 'react';
import { Links } from '@remix-run/react';
import { Icon } from 'react-lazy-svg';
import icon1 from '../icons/icon1.svg';
import icon2 from '../icons/icon2.svg';

import stylesheetUrl from '../styles.css';

export function links() {
  return [{ rel: 'stylesheet', href: stylesheetUrl }];
}

export default function Index() {
  const [showInitial, setShowInitial] = useState(true);

  return (
    <div className="Home">
      <div className="Home-header">
        <h1>🦥 react-lazy-svg</h1>
        <p>
          The icon is loaded on the {showInitial ? 'server' : 'client'}. Size
          and color is set via css.
        </p>
        {showInitial ? (
          <>
            <Icon url={icon1} className="icon"></Icon>
            <Icon url={icon1} className="icon red"></Icon>
            <Icon url={icon1} className="icon blue large"></Icon>
          </>
        ) : (
          <>
            <Icon url={icon2} className="icon"></Icon>
            <Icon url={icon2} className="icon red"></Icon>
            <Icon url={icon2} className="icon blue large"></Icon>
          </>
        )}
        <button onClick={() => setShowInitial(!showInitial)}>
          toggle icon
        </button>
      </div>
    </div>
  );
}
