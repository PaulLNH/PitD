const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const _ = require('lodash');
const PORT = process.env.PORT || 8080;

var games = {};
var players = {};
const masterSpawn = {
    sp1: {
        x: 163,
        y: 92
    },
    sp2: {
        x: 521,
        y: 409
    },
    sp3: {
        x: 552,
        y: 139
    },
    sp4: {
        x: 145,
        y: 366
    },
    sp5: {
        x: 375,
        y: 112
    },
    sp6: {
        x: 310,
        y: 388
    },
    sp7: {
        x: 35.5,
        y: 264
    },
    sp8: {
        x: 463,
        y: 257
    }
}

var scores = {
    human: 0,
    zombie: 0
};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', socket => {
    console.log('a user connected: ', socket.id);
    // create a new player and add it to our players object
    // Username, Id, spawnPoint, team, 
    players[socket.id] = {
        username: "Paul",
        playerId: socket.id,
        x: 163,
        y: 92,
        // sp: randomSpawn(),
        team: assignTeam(),
        speed: 100
    };

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // // send the star object to the new player
    // socket.emit('starLocation', star);
    // // send the current scores
    // socket.emit('scoreUpdate', scores);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // // when a player disconnects, remove them from our players object
    // socket.on('disconnect', () => {
    //     console.log(`${socket.id} has left the game.`);
    //     delete players[socket.id];
    //     // emit a message to all players to remove this player
    //     io.emit('disconnect', socket.id);
    // });

    // when a player moves, update the player data
    socket.on('playerMovement', movementData => {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    // socket.on('starCollected', () => {
    //     if (players[socket.id].team === 'red') {
    //         scores.red += 10;
    //     } else {
    //         scores.blue += 10;
    //     }
    //     star.x = Math.floor(Math.random() * 700) + 50;
    //     star.y = Math.floor(Math.random() * 500) + 50;
    //     io.emit('starLocation', star);
    //     io.emit('scoreUpdate', scores);
    // });
});

function randomSpawn () {
    var spawn;
    var spMax = _.keys(masterSpawn).length;
    spawn = masterSpawn[Math.floor(Math.floor(Math.random() * (spMax - 0 + 1)) + 0)];
    console.log(`Creating player at spawn point: ${spawn}`);
    return spawn
}

function assignTeam () {
    var team = (Math.floor(Math.random() * 2) == 0) ? 'human' : 'zombie';
    console.log(`on team: ${team}`);
    return team
}

server.listen(PORT, () => console.log(`Listening on ${server.address().port}`));