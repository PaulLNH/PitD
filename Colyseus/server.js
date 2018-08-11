const { Server, Room } = require("colyseus");
const { createServer } = require("http");
const PORT = process.env.PORT || 4000;

const gameServer = new Server({
  server: createServer()
});

class ExampleRoom extends Room {
  // When client successfully join the room
  onJoin (client) {
    console.log(`client ${client.id} joined`)
  }
}

gameServer.listen(PORT);

console.log(`Listening on localhost:${PORT}`);