const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jwt-express');
const app = express();
const env = process.env.NODE_ENV || "development";
const config = require(`${__dirname}/config/config.json`)[env];
const server = require('http').createServer(app);
const _ = require('lodash');

// const WSPORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 8080;
const db = require("./models");
const io = require('socket.io').listen(server);

// Express middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(jwt.init(config.tokenSecret, {
    cookies: false
}));
app.use((err, req, res, next) => {
    console.log(`${req.method} ${req.url} - ${err.message}`);

    if (err.name == 'JWTExpressError') err.status = 401;

    res.status(err.status || 400).send({
        message: `${err.message}`
    });
});

// Api routes
require("./api/account.js")(app);
require("./api/admin.js")(app);
require("./api/html.js")(app);

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// TODO:
// - Add notice that the player has died and they will respawn at the end of the surge
// - Increment score for each second alive during hunted phaser
// - Add more detailed stats: Kills, Deaths
// - Add camera shake when player dies (Code in place, just have to activate it on an event)
// - Add flashing when power surges (Code in place, just have to activate it on an event. May conflict with the camera shake)
// - Implement a menu bar at bottom
// - Create a "lobby" mode where all players see darkness and game won't start until someone presses the "Ready" button
// - Add music w/ mute button on the menu bar
// - Add sound from players dying

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

var timeLeft = 10;

// Timer
var countDown = function () {
    var resurrect = [];

    if (timeLeft == 0) {
        timeLeft = maxTimePerRound;

        var spawnCounter = 0;
        Object.keys(players).forEach(function (id) {

            if (players[id].alive == false) {
                players[id].alive = true;
                var spawn = masterSpawn[spawnCounter];
                spawnCounter++;
                var playerSpawn = {
                    id: id,
                    x: spawn.x,
                    y: spawn.y
                };
                resurrect.push(playerSpawn);
            }
        });

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
    }
    io.sockets.emit('timer', {
        timeLeft: timeLeft,
        huntTeam: huntTeam,
        resurrect: resurrect
    });
}

setInterval(countDown, 1000);

var scores = {
    human: 0,
    zombie: 0
};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', socket => {
    console.log('a user connected: ', socket.id);

    var getSpawn = function () {
        let sp = masterSpawn;
        let i = _.keys(players).length;
        return sp[i]
    }

    var assignTeam = function () {
        let humans = 0;
        let zombies = 0;
        let team;
        // Logic to see if a player exists this occurs before the player is added to the players object.

        // If there are no players in the game, push the next to the humans team.
        if (_.keys(players).length <= 0) {
            return team = "human"
        } else {
            // If there are players in the game, get all the players and check their teams, iterate +1 for each team that is represnted in the game.
            Object.keys(players).forEach(function (id) {
                if (players[id].team == "human") {
                    humans++;
                } else if (players[id].team == "zombie") {
                    zombies++;
                }
            });
            // If there are equal or less humans, return human team.
            if (humans <= zombies) {
                team = "human";
            } else {
                team = "zombie";
            }
        }
        return team
    }

    // create a new player and add it to our players object
    players[socket.id] = {
        // Form validation to display username as standard name case
        username: "",
        playerId: socket.id,
        directionMoving: "none",
        sp: getSpawn(),
        alive: true,
        team: assignTeam(),
        speed: 100,
        score: 0,
        kills: 0,
        deaths: 0,
        usernameText: null,
        time: timeLeft,
    };

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // // send the current scores
    // socket.emit('scoreUpdate', scores);

    // Get a username back from the player logging in
    socket.on('updateUsername', (userData) => {
        players[userData.id].username = userData.username;
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', () => {
        console.log(`${socket.id} has left the game.`);
        // Send players[socket.id].scores to the database
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
        // console.log(id);
        if (players[id.victim].alive) {

            // console.log(`Looks like ${id.victim} has died.`);
            players[id.victim].alive = false;
            io.emit('characterDied', id.victim);

            players[id.attacker].score
            if (players[id.attacker].team === 'human') {
                scores.human += 10;
            } else {
                scores.zombie += 10;
            }
            io.emit('scoreUpdate', {
                scores: scores,
                attackerScore: players[id.attacker].score
            });
        }
    });
});

// Sync sequelize then start http server
db.sequelize.sync().then(function () {
    server.listen(PORT, () => console.log(`Listening on ${PORT}`));
});