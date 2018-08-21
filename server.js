const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jwt-express");
const app = express();
const env = process.env.NODE_ENV || "development";
const config = require(`${__dirname}/config/config.json`)[env];
const server = require("http").Server(app);
const _ = require("lodash");

const PORT = process.env.PORT || 8080;
const db = require("./models");
const io = require("socket.io").listen(server);

// Express middleware
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  jwt.init(config.tokenSecret, {
    cookies: false
  })
);
app.use((err, req, res, next) => {
  console.log(`${req.method} ${req.url} - ${err.message}`);

  if (err.name == "JWTExpressError") err.status = 401;

  res.status(err.status || 400).send({
    message: `${err.message}`
  });
});

// Api routes
require("./api/account.js")(app);
require("./api/admin.js")(app);
require("./api/html.js")(app);

var games = {};
var players = {};
// Timer in seconds
const maxTimePerRound = 10;
var huntTeam = "zombie";
const masterSpawn = [
  {
    x: 163,
    y: 92
  },
  {
    x: 521,
    y: 409
  },
  {
    x: 552,
    y: 139
  },
  {
    x: 145,
    y: 366
  },
  {
    x: 375,
    y: 112
  },
  {
    x: 310,
    y: 388
  },
  {
    x: 35,
    y: 264
  },
  {
    x: 463,
    y: 257
  }
];

var timeLeft = 10;

// Timer
var countDown = function() {
  if (timeLeft == 0) {
    console.log(`Resetting timer`);
    timeLeft = maxTimePerRound;
    switch (huntTeam) {
      case "human":
        huntTeam = "zombie";
        break;
      case "zombie":
        huntTeam = "human";
        break;
      default:
        huntTeam = "zombie";
    }
  } else {
    timeLeft--;
    console.log(timeLeft);
  }
  console.log(huntTeam);
  io.sockets.emit("timer", {
    timeLeft: timeLeft,
    huntTeam: huntTeam
  });
};

setInterval(countDown, 1000);

var scores = {
  human: 10,
  zombie: 25
};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

io.on("connection", socket => {
  console.log("a user connected: ", socket.id);

  var getSpawn = function() {
    let sp = masterSpawn;
    let i = _.keys(players).length;
    console.log(sp[i]);
    return sp[i];
  };
  // create a new player and add it to our players object
  // Username, Id, spawnPoint, team,
  players[socket.id] = {
    // Form validation to display username as standard name case
    username: _.startCase(_.toLower(randUsername())),
    playerId: socket.id,
    // x: 163,
    // y: 92,
    directionMoving: "none",
    sp: getSpawn(),
    team: assignTeam(),
    speed: 100,
    score: 0,
    usernameText: null,
    time: timeLeft,
    // spawnLocation: function(masterSpawn) {
    //   let sp = masterSpawn;
    //   let i = _.keys(players).length;
    //   console.log(sp[i]);
    //   return sp[i];
    // }
  };
  console.log(timeLeft);

  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // // send the current scores
  socket.emit("scoreUpdate", scores);
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on("disconnect", () => {
    console.log(`${socket.id} has left the game.`);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });

  // when a player moves, update the player data
  socket.on("playerMovement", movementData => {
    players[socket.id].directionMoving = movementData.directionMoving;
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // emit a message to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("characterDies", id => {
    console.log(`Looks like ${id}`);
    io.emit("characterDied", id);
  });

  socket.on("playerTagged", headToHead => {
    console.log(`Yup, server says we have collision! ${headToHead}`);
    if (players[socket.id].team === "human") {
      players[socket.id].score;
      scores.human += 10;
    } else {
      scores.zombie += 10;
    }
    io.emit("scoreUpdate", scores);
  });
});

function assignTeam() {
  var team = Math.floor(Math.random() * 2) == 0 ? "human" : "zombie";
  console.log(`on team: ${team}`);
  return team;
}

function randUsername() {
  var name = Math.floor(Math.random() * 2) == 0 ? "Paul" : "Jashan";
  console.log(`random name: ${name}`);
  return name;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sync sequelize and start http server
db.sequelize.sync().then(function() {
  server.listen(PORT, () =>
    console.log(`Listening on ${server.address().port}`)
  );
});
