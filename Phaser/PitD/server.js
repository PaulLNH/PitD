const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const _ = require('lodash');
const PORT = process.env.PORT || 8080;

var games = {};
var players = {};
// Timer in seconds
const maxTimePerRound = 10;
var zombiesHunting = null;
const masterSpawn = [{
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
]

////////////////// TODO: 
// - Create an interval timer on the server
// - Switch state of zombiesHunting based on timer
// - Form validation on names: min 1, max 8, 

var timeLeft = 10;

var timerId = setInterval(countDown, 1000);

function countDown() {
  if (timeLeft == 0) {
    clearTimeout(timerId);
    timeLeft = maxTimePerRound;
    // Logic to emit the timer has reset
  } else {
    timeLeft--;
  }
}

var scores = {
    human: 10,
    zombie: 25
};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', socket => {
    console.log('a user connected: ', socket.id);

    var getSpawn = function () {
        let sp = masterSpawn;
        let i = _.keys(players).length;
        console.log(sp[i]);
        return sp[i]
    }
    // create a new player and add it to our players object
    // Username, Id, spawnPoint, team, 
    players[socket.id] = {
        // Form validation to display username as standard name case
        username: _.startCase(_.toLower('PaUl')),
        playerId: socket.id,
        x: 163,
        y: 92,
        directionMoving: "none",
        sp: getSpawn(),
        team: assignTeam(),
        speed: 100,
        score: 0,
        spawnLocation: function (masterSpawn) {
            let sp = masterSpawn;
            let i = _.keys(players).length;
            console.log(sp[i]);
            return sp[i]
        }
    };

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // // send the current scores
    socket.emit('scoreUpdate', scores);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', () => {
        console.log(`${socket.id} has left the game.`);
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', movementData => {
        players[socket.id].directionMoving = movementData.directionMoving;
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('playerTagged', headToHead => {
        console.log(`Yup, server says we have collision! ${headToHead}`);
        if (players[socket.id].team === 'human') {
            players[socket.id].score
            scores.human += 10;
        } else {
            scores.zombie += 10;
        }
        io.emit('scoreUpdate', scores);
    });
});

// function randomSpawn() {
//     var spMax = _.keys(masterSpawn).length;
//     var spawn = _.values(masterSpawn);
//     spawn = spawn[getRandomInt(0, spMax)];
//     console.log(`Spawning at x: ${spawn.x}, y: ${spawn.y}`);
//     return spawn
// }


function assignTeam() {
    var team = (Math.floor(Math.random() * 2) == 0) ? 'human' : 'zombie';
    console.log(`on team: ${team}`);
    return team
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

server.listen(PORT, () => console.log(`Listening on ${server.address().port}`));