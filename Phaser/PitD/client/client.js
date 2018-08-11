const Colyseus = require("colyseus.js");

let client = new Colyseus.Client("ws://localhost:4000");

let room = client.join("battle");

room.onJoin.add(() => {
  console.log("client joined successfully");
});