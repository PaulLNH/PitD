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
var huntTeam = "zombie";
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
// - Switch state of zombiesHunting based on timer
// - Form validation on names: min 1, max 8, name case "_.startCase(_.toLower('UseRnaMe'))" Although this should be done when we gather the players username going into the database.

var timeLeft = 10;

// Timer
var countDown = function () {
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
    io.sockets.emit('timer', {timeLeft: timeLeft, huntTeam: huntTeam});
}

setInterval(countDown, 1000);

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
        // players(id).x = sp[i].x;
        // players(id).y = sp[i].y;
        return sp[i]
    }
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
        spawnLocation: function (masterSpawn) {
            let sp = masterSpawn;
            let i = _.keys(players).length;
            console.log(sp[i]);
            return sp[i]
        }
    };
    console.log(timeLeft);
    // TODO:
    // CANNOT USER IF STATEMENT HERE, ONLY SENDS ON CONNECTION.
    // NEED TO FIND ANOTHER WAY TO SYNC CLIENTS TIMER
    // if (resetTimer) {
    //     console.log(`Emitting timer reset node`);
    //     socket.emit('timerUpdate');
    // }

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

    socket.on('characterDies', id => {
        console.log(`Looks like ${id}`);
        io.emit('characterDied', id);
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

function randUsername() {
    var name = (Math.floor(Math.random() * 2) == 0) ? 'Paul' : 'Jashan';
    console.log(`random name: ${name}`);
    return name
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

server.listen(PORT, () => console.log(`Listening on ${server.address().port}`));