// import * as PIXI from 'pixi.js'
// import Application from './Application';
// import TitleScreen from './screens/TitleScreen'

// var loader = new PIXI.loaders.Loader();
// loader.add('logo', 'images/logo.png')
// loader.add('background', 'images/background.jpg')
// loader.add('colyseus', 'images/colyseus.png')

// loader.add('clock-icon', 'images/clock-icon.png')
// loader.add('board', 'images/board.png')

// loader.on('complete', () => {
//     console.log(`In the client side loader in main.js`);
//   var loading = document.querySelector('.loading');
//   document.body.removeChild(loading);

//   var app = new Application()
//   app.gotoScene (TitleScreen)
//   app.update()
// })

// loader.load();

// define endpoint based on environment
const endpoint = (window.location.hostname.indexOf("herokuapp") === -1)
  ? "ws://localhost:3553" // development (local)
  : `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}` // production (remote)

  import { Client } from 'colyseus.js'
window.colyseus = new Client(endpoint);