import React from 'react';
import logo from './react.svg';
import './Home.css';
import { Icon } from 'react-lazy-svg';

const Home = () => {
  return (
    <div className="Home">
      <div className="Home-header">
        <Icon url={logo} className="Home-logo"></Icon>
        <h2>Welcome to Razzle</h2>
      </div>
      <p className="Home-intro">
        To get started, edit <code>src/App.js</code> or <code>src/Home.js</code>{' '}
        and save to reload.
      </p>
      <ul className="Home-resources">
        <li>
          <a href="https://github.com/jaredpalmer/razzle">Docs</a>
        </li>
        <li>
          <a href="https://github.com/jaredpalmer/razzle/issues">Issues</a>
        </li>
        <li>
          <a href="https://palmer.chat">Community Slack</a>
        </li>
      </ul>
    </div>
  );
};

export default Home;
