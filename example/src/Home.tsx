import React from 'react';
import logo from './react.svg';
import './Home.css';
import { Icon } from 'react-lazy-svg';

const Home = () => {
  return (
    <div className="Home">
      <div className="Home-header">
        <h1>🦥 react-lazy-svg</h1>
        <Icon url={logo} className="Home-logo"></Icon>
      </div>
    </div>
  );
};

export default Home;
