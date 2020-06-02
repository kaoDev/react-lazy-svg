import React, { useState } from 'react';
import { Icon } from 'react-lazy-svg';
import icon1 from './icon1.svg';
import icon2 from './icon2.svg';

import './App.css';

const App = () => {
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
};

export default App;
