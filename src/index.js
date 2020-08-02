import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {loadTheme, initializeIcons } from '@fluentui/react';

loadTheme({
  palette: {
    themePrimary: '#358510',
    themeLighterAlt: '#f4faf1',
    themeLighter: '#d5ebca',
    themeLight: '#b3daa1',
    themeTertiary: '#74b656',
    themeSecondary: '#459321',
    themeDarkAlt: '#30770e',
    themeDark: '#28650c',
    themeDarker: '#1e4a09',
    neutralLighterAlt: '#f8f8f8',
    neutralLighter: '#f4f4f4',
    neutralLight: '#eaeaea',
    neutralQuaternaryAlt: '#dadada',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c8c8',
    neutralTertiary: '#595959',
    neutralSecondary: '#373737',
    neutralPrimaryAlt: '#2f2f2f',
    neutralPrimary: '#000000',
    neutralDark: '#151515',
    black: '#0b0b0b',
    white: '#ffffff',
  }});

initializeIcons();

ReactDOM.render(
  // <React.StrictMode>
    // <Provider theme={GongGongTheme}>
      <App />
    // </Provider>
  // </React.StrictMode>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
