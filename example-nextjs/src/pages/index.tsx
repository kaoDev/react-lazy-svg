import type { NextPage } from 'next';
import { useState } from 'react';
import { Icon } from 'react-lazy-svg';
import icon1 from '../assets/icons/icon1.svg';
import icon2 from '../assets/icons/icon2.svg';

const Home: NextPage = () => {
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
            <Icon url={icon1.src} className="icon"></Icon>
            <Icon url={icon1.src} className="icon red"></Icon>
            <Icon url={icon1.src} className="icon blue large"></Icon>
          </>
        ) : (
          <>
            <Icon url={icon2.src} className="icon"></Icon>
            <Icon url={icon2.src} className="icon red"></Icon>
            <Icon url={icon2.src} className="icon blue large"></Icon>
          </>
        )}
        <button onClick={() => setShowInitial(!showInitial)}>
          toggle icon
        </button>
      </div>
    </div>
  );
};

export default Home;
