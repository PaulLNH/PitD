// NOTE: Cleint needs to npm i colyseus.js (yes, .js is the client version of colyseus)
// Browsers can't require because they don't have access to the file system so compiling 
// your code with webpack or something like that will take your required and make one 
// large file that holds the colyseus code. See: https://parceljs.org/
// run npm i -g parcel-bundler
// npm init -y
// npm i colyseus.js
// parcel index.html -p 8080 (or it defaults to 1234 if you don't define a -p)
import Colyseus from 'colyseus.js';
// const Colyseus = require("colyseus.js");

let client = new Colyseus.Client("ws://localhost:4000");

let room = client.join("battle");

room.onJoin.add(() => {
  console.log("client joined successfully");
});