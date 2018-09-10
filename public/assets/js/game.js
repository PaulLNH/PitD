// If game needs to be used via webpack for socket to work properly w/ react,
// use this template: https://github.com/photonstorm/phaser3-project-template


const config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 640, // Canvas width in pixels (usually 800) - 171 /w mario tile example
    height: 480, // Canvas height in pixels (usually 600) - 160 /w mario tile example
    zoom: 1, // Since we're working with 16x16 pixel tiles, let's scale up the canvas by 3x
    pixelArt: true, // Force the game to scale images up crisply
    parent: "pitd", // ID of the DOM element to add the canvas to
    scene: {
        preload: preload,
        create: create,
        update: update,
        render: render
    },
    physics: {
        default: "arcade", // Simplest physics, box and circle colliders
        arcade: {
            gravity: {
                y: 0 // Top down game, so no gravity
            }
        }
    }
};

// var huntTeamElement = $("#huntTeam");
var topBar = $("#topProgressBar");
var humanScore = $('#humanScore');
var zombieScore = $('#zombieScore');
var statusText = $('#statusText');
var killerAvatar = $('#killerAvatar');
var scoreScreen = $('#scoreScreen');
scoreScreen.hide();

// Instanciate a new game instance
const game = new Phaser.Game(config);
var collisionLayer;
const speed = 100;

// Set to true to display collision debugging layer
let showDebug = true;
var spotlight;
var dark;
var timer;
var timeLeft = 10;
var huntTeam = "";
var clientId = "";
var numHumans = 0;
var numZombies = 0;

//////////////////////// PRELOAD ///////////////////////////
// This runs once before anything else, loads up assets like images and audio
function preload() {
    this.load.image("tiles", "../assets/tilesets/tilesets.png");
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/map.json");
    this.load.image("dark", "assets/sprites/dark.png");
    this.load.spritesheet("human", "../assets/sprites/human.png", {
        frameWidth: 16, // 16px human width
        frameHeight: 32
    });
    this.load.spritesheet("zombie", "../assets/sprites/zombie.png", {
        frameWidth: 20, // 20px zombie width
        frameHeight: 32
    });
    this.load.image("mask", "assets/sprites/mask.png");
}

//////////////////////// CREATE ///////////////////////////
// Loads elements into Phaser's cache (i.e. the name you used in preload)
function create() {
    // Initialize WASD controlls
    this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // flashCamera = this.cameras.add(0, 0, 640, 480);
    shakeCamera = this.cameras.add(0, 0, 640, 480);

    ///// START MAP AND COLLISION /////
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    const map = this.make.tilemap({
        key: "map",
        tileWidth: 16,
        tileHeight: 16
    });
    const tileset = map.addTilesetImage("tileset", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    collisionLayer = map.createStaticLayer("collision", tileset, 0, 0);
    const belowLayer = map.createStaticLayer("below", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("world", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("above", tileset, 0, 0);
    const aboveDecorLayer = map.createStaticLayer("aboveDecor", tileset, 0, 0);
    const decorLayer = map.createStaticLayer("decor", tileset, 0, 0);

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);
    aboveDecorLayer.setDepth(11);
    collisionLayer.setDepth(0);

    collisionLayer.setCollisionByProperty({
            collides: true
        },
        true
    );

    // Debug collision //
    if (showDebug) {
        const debugGraphics = this.add.graphics().setAlpha(0.75);
        collisionLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        this.physics.world.createDebugGraphic();
    }

    ///// END MAP AND COLLISION /////

    //////////////////////////////////////////////////////////////////////////////

    ///// START PLAYER CONTROLLER /////
    var self = this;
    this.socket = io();

    this.socket.emit("connection")

    this.otherPlayers = this.physics.add.group({
        key: 'enemy'
    });

    this.socket.on("currentPlayers", function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on("newPlayer", function (playerInfo) {
        addOtherPlayers(self, playerInfo);
        statusText.text(`${playerInfo.username} has entered the game.`);
        if (playerInfo.team == "human") {
            $("#killerAvatar").attr("src", "./assets/images/AH1.png");
        } else {
            $("#killerAvatar").attr("src", "./assets/images/AZ1.png");
        }
    });

    this.socket.on("disconnect", function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
                otherPlayer.usernameText.destroy();
            }
        });
    });

    // Darkness mask
    dark = self.add.image(0, 0, "dark");
    spotlight = self.make.sprite({
        x: 100,
        y: 100,
        key: "mask",
        add: true
    });
    spotlight.setScale(0.5);
    dark.mask = new Phaser.Display.Masks.BitmapMask(self, spotlight);
    // this.player.mask = new Phaser.Display.Masks.BitmapMask(self, spotlight);

    // dark.setDepth(35);
    // spotlight.setDepth(35);
    // if (self.player.data.values.team == huntTeam) {
    //     dark.setDepth(-10);
    //     spotlight.setDepth(-10);
    // } else {
    //     dark.setDepth(35);
    //     spotlight.setDepth(35);
    // }

    this.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.usernameText.x = otherPlayer.x - otherPlayer.usernameText.displayWidth / 2;
                otherPlayer.usernameText.y = otherPlayer.y - otherPlayer.height + 5;
                // Moves other players around
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);

                // Animate other player
                // this.player is moving right
                if (playerInfo.directionMoving == "right") {
                    if (playerInfo.team == "human") {
                        otherPlayer.anims.play("humanRight", true);
                    } else {
                        otherPlayer.anims.play("zombieRight", true);
                    }
                    // this.player is moving left
                } else if (playerInfo.directionMoving == "left") {
                    if (playerInfo.team == "human") {
                        otherPlayer.anims.play("humanLeft", true);
                    } else {
                        otherPlayer.anims.play("zombieLeft", true);
                    }
                }

                // this.player is not moving left or right
                if (
                    playerInfo.directionMoving !== "right" &&
                    playerInfo.directionMoving !== "left"
                ) {
                    // this.player is moving up
                    if (playerInfo.directionMoving == "up") {
                        if (playerInfo.team == "human") {
                            otherPlayer.anims.play("humanUp", true);
                        } else {
                            otherPlayer.anims.play("zombieUp", true);
                        }
                        // this.player is moving down
                    } else if (playerInfo.directionMoving == "down") {
                        if (playerInfo.team == "human") {
                            otherPlayer.anims.play("humanDown", true);
                        } else {
                            otherPlayer.anims.play("zombieDown", true);
                        }
                        // this.player is not moving left, right, up or down
                    } else {
                        // this.player.anims.stop();
                    }
                }

                if (playerInfo.directionMoving == "none") {
                    otherPlayer.anims.stop();
                }
                // self.physics.add.overlap(self.player, otherPlayer, headToHead, null, self);
            }
            //////// PLAYERS TAGGING ONE ANOTHER ///////
            // self.physics.add.overlap(self.player, self.otherPlayers, headToHead, null, self);
        });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    ///// START HUMAN ANIMATIONS ////
    this.anims.create({
        key: "humanLeft",
        frames: this.anims.generateFrameNumbers("human", {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "humanTurn",
        frames: [{
            key: "human",
            frame: 2
        }],
        frameRate: 20
    });

    this.anims.create({
        key: "humanRight",
        frames: this.anims.generateFrameNumbers("human", {
            start: 6,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "humanUp",
        frames: this.anims.generateFrameNumbers("human", {
            start: 9,
            end: 11
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "humanDown",
        frames: this.anims.generateFrameNumbers("human", {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });

    ///// START ZOMBIE ANIMATIONS ////
    this.anims.create({
        key: "zombieLeft",
        frames: this.anims.generateFrameNumbers("zombie", {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "zombieTurn",
        frames: [{
            key: "zombie",
            frame: 2
        }],
        frameRate: 20
    });

    this.anims.create({
        key: "zombieRight",
        frames: this.anims.generateFrameNumbers("zombie", {
            start: 6,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "zombieUp",
        frames: this.anims.generateFrameNumbers("zombie", {
            start: 9,
            end: 11
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "zombieDown",
        frames: this.anims.generateFrameNumbers("zombie", {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });
    //// END ANIMATIONS ////

    //// START SCORE UPDATE ////
    // this.blueScoreText = this.add.text(16, 3, "Human: 0", {
    //     fontSize: "32px",
    //     fill: "#0000FF"
    // });
    // this.redScoreText = this.add.text(425, 3, "Zombie: 0", {
    //     fontSize: "32px",
    //     fill: "#FF0000"
    // });
    // this.huntingTeam = this.add.text(200, 450, "", {
    //     fontSize: "32px",
    //     fill: "#FF0000",
    //     fontWeight: "bold"
    // });

    this.youHaveDied = this.add.text(20, 225, "You Have Died, respawingin in: ", {
        fontSize: "32px",
        fill: "#000000",
        fontWeight: "bold"
    });
    this.youHaveDied.alpha = 0;

    this.socket.on("scoreUpdate", function (scores) {
        // console.log(scores);
        humanScore.text(scores.scores.human);
        zombieScore.text(scores.scores.zombie);
        // self.blueScoreText.setText("Human: " + scores.scores.human);
        // self.redScoreText.setText("Zombie: " + scores.scores.zombie);
    });
    //// END SCORE UPDATE ////

    //// START TIMER ////
    // this.timerText = this.add.text(250, 3, "", {
    //     fontSize: "32px",
    //     fill: "#FFFFFF"
    // });

    // self.timerText.setText(``);
    // self.timerText.setDepth(40);
    // self.huntingTeam.setDepth(40);
    // self.blueScoreText.setDepth(40);
    // self.redScoreText.setDepth(40);

    this.socket.on("timer", function (timerData) {
        // console.log("Timer: " + timerData.timeLeft);
        updateLeaderboard(timerData.players);
        topBar.text(`The ${huntTeam} team is hunting for another ${timerData.timeLeft} seconds.`);
        topBar.css('width', (timerData.timeLeft * 10) + '%').attr('aria-valuenow', (timerData.timeLeft * 10));
        if (self.player.data.values.team == huntTeam && self.player.data.values.alive) {
            topBar.attr('class', 'progress-bar bg-success');
        } else if (self.player.data.values.team !== huntTeam && self.player.data.values.alive) {
            topBar.attr('class', 'progress-bar bg-danger');
        } else {
            topBar.attr('class', 'progress-bar bg-warning');
        }
        self.youHaveDied.setText("You have died, respawning in: " + timerData.timeLeft);
        // self.timerText.setText("Timer: " + timerData.timeLeft);
        // self.huntingTeam.setText("Hunting: " + timerData.huntTeam);
        huntTeam = timerData.huntTeam;

        // Points for being alive during hunted phase
        if (self.player.data.values.alive && self.player.data.values.team !== huntTeam && timerData.timeLeft !== 10) {
            // console.log(`${clientId} has survived 1 second of hunting.`);
            self.socket.emit("alivePoints", clientId);
        };

        if (timerData.timeLeft == 10) {
            topBar.text(`The ${huntTeam} team is hunting for another ${timerData.timeLeft} seconds.`);
            if (self.player.data.values.team == huntTeam && self.player.data.values.alive) {
                topBar.attr('class', 'progress-bar bg-success');
            } else if (self.player.data.values.team !== huntTeam && self.player.data.values.alive) {
                topBar.attr('class', 'progress-bar bg-danger');
            } else {
                topBar.attr('class', 'progress-bar bg-warning');
            }

            // huntTeamElement.text(nameCase(huntTeam));
            // flashCamera.flash(750);
            for (i = 0; i < timerData.resurrect.length; i++) {
                if (clientId == timerData.resurrect[i].id) {
                    self.player.enableBody(true, timerData.resurrect[i].x, timerData.resurrect[i].y, true, true);
                    self.player.usernameText.x =
                        self.player.x - self.player.usernameText.width / 2;
                    self.player.usernameText.y = self.player.y - self.player.height + 5;
                    self.youHaveDied.alpha = 0;
                    self.player.usernameText.alpha = 1;
                    self.player.data.values.alive = true;
                    if (self.player.data.values.team == huntTeam) {
                        dark.setDepth(-10);
                        spotlight.setDepth(-10);
                    } else {
                        dark.setDepth(35);
                        spotlight.setDepth(35);
                    }
                } else {
                    // self.player.enableBody(true, true);
                    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                        // otherPlayer.enableBody(false, false);
                        if (otherPlayer.playerId == timerData.resurrect[i].id) {
                            otherPlayer.enableBody(true, timerData.resurrect[i].x, timerData.resurrect[i].y, true, true);
                            otherPlayer.usernameText.x =
                                otherPlayer.x - otherPlayer.usernameText.width / 2;
                            otherPlayer.usernameText.y = otherPlayer.y - otherPlayer.height + 5;
                            otherPlayer.usernameText.alpha = 1;
                            otherPlayer.alive = true;
                        }
                    });
                }
            }
        }
        // console.log(`Currently hunting: ${timerData.huntTeam}`);
        99
    });
    //// END TIMER ////

    this.socket.on("characterDied", function (id) {
        console.log(`${JSON.stringify(id)}`);
        // TODO: Revisit this logic and make all kills show in the status window with the killers team avatar appearing.

        // If this player is the attacker, show that he killed the other player and remove that player from the game.
        if (clientId == id.attacker) {
            if (self.player.data.values.team == "human") {
                $("#killerAvatar").attr("src", "./assets/images/AH1.png");
            } else {
                $("#killerAvatar").attr("src", "./assets/images/AZ1.png");
            }
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (otherPlayer.playerId == id.victim) {
                    statusText.text(`You killed ${otherPlayer.name}.`);
                    otherPlayer.usernameText.alpha = 0;
                    otherPlayer.disableBody(true, true);
                    otherPlayer.alive = false;
                }
            });
        } else if (clientId == id.victim) {
            // If this player is the victim then display the other player that has killed you
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (otherPlayer.playerId == id.attacker) {
                    if (otherPlayer.team == "human") {
                        $("#killerAvatar").attr("src", "./assets/images/AH1.png");
                    } else {
                        $("#killerAvatar").attr("src", "./assets/images/AZ1.png");
                    }
                    statusText.text(`${otherPlayer.name} has killed you.`);
                }
            });
            self.player.disableBody(true, true);
            self.youHaveDied.alpha = 1;
            self.player.usernameText.alpha = 0;
            self.player.data.values.alive = false;
            shakeCamera.shake(1000);
        } else {
            // If this player is neither the killer or the victim, do something
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (otherPlayer.playerId == id.victim) {
                    otherPlayer.usernameText.alpha = 0;
                    otherPlayer.disableBody(true, true);
                    otherPlayer.alive = false;
                }
            });
        }
    });
}



function update() {
    // flashCamera will add a full screen flashing effect, use this for transitioning from light to dark
    // flashCamera.flash(1000);

    // shakeCamera will add a shaking effect to the camera, use this for player death
    // shakeCamera.shake(1000);

    if (this.player) {
        // Players name above their head
        this.player.usernameText.x =
            this.player.x - this.player.usernameText.width / 2;
        this.player.usernameText.y = this.player.y - this.player.height + 5;
        // Darkness mask follows character
        dark.x = this.player.x;
        dark.y = this.player.y;
        spotlight.x = this.player.x;
        spotlight.y = this.player.y;


        dark.setDepth(-10);
        spotlight.setDepth(-10);
        // console.log(this.player.data.values.alive);

        if (this.player.data.values.alive == true && this.player.data.values.team !== huntTeam) {
            dark.setDepth(35);
            spotlight.setDepth(35);
        }

        // Default velocity is 0 (stopped)
        this.player.body.velocity.set(0);

        if (this.cursors.space.isDown) {
            scoreScreen.show();
        } else {
            scoreScreen.hide();
        }

        // If a player is not pressing anything, stop their directionMoving
        if (!this.cursors.left.isDown &&
            !this.left.isDown &&
            !this.cursors.right.isDown &&
            !this.right.isDown &&
            !this.cursors.up.isDown &&
            !this.up.isDown &&
            !this.cursors.down.isDown &&
            !this.down.isDown
        ) {
            this.player.setData({
                directionMoving: "none"
            });
        }

        // Player is pressing left
        if (this.cursors.left.isDown || this.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setData({
                directionMoving: "left"
            });
        } else if (this.cursors.right.isDown || this.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setData({
                directionMoving: "right"
            });
        }

        if (this.cursors.up.isDown || this.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.setData({
                directionMoving: "up"
            });
        } else if (this.cursors.down.isDown || this.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.setData({
                directionMoving: "down"
            });
        }

        this.player.setDataEnabled();
        // Assigns the username to the clients player based on username from server

        // this.player is moving right
        if (this.player.body.velocity.x > 0) {
            if (this.player.data.values.team == "human") {
                this.player.anims.play("humanRight", true);
            } else {
                this.player.anims.play("zombieRight", true);
            }
            // this.player is moving left
        } else if (this.player.body.velocity.x < 0) {
            if (this.player.data.values.team == "human") {
                this.player.anims.play("humanLeft", true);
            } else {
                this.player.anims.play("zombieLeft", true);
            }
        }

        // this.player is not moving left or right
        if (this.player.body.velocity.x == 0) {
            // this.player is moving up
            if (this.player.body.velocity.y < 0) {
                if (this.player.data.values.team == "human") {
                    this.player.anims.play("humanUp", true);
                } else {
                    this.player.anims.play("zombieUp", true);
                }
                // this.player is moving down
            } else if (this.player.body.velocity.y > 0) {
                if (this.player.data.values.team == "human") {
                    this.player.anims.play("humanDown", true);
                } else {
                    this.player.anims.play("zombieDown", true);
                }
                // this.player is not moving left, right, up or down
            } else {
                this.player.anims.stop();
            }
        }

        // Prevents character from moving faster while pressing two directions
        this.player.body.velocity.normalize().scale(speed);

        this.physics.add.overlap(this.player, this.otherPlayers, headToHead, null, this);
        // emit player movement
        var x = this.player.x;
        var y = this.player.y;
        if (
            this.player.oldPosition &&
            (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)
        ) {
            // Check for collision

            // this.physics.add.overlap(this.player, this.otherPlayers, headToHead, null, this);
            // var self = this;
            // this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            //     if (self.player.data.values.alive && otherPlayer.alive) {
            //         self.physics.add.overlap(self.player, otherPlayer, headToHead, null, self);
            //     }
            // });

            this.socket.emit("playerMovement", {
                directionMoving: this.player.data.values.directionMoving,
                x: this.player.x,
                y: this.player.y
            });
        }
        // save old position data
        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y
        };
    }
}

function render() {
    game.debug.bodyInfo(player, 32, 32);
    game.debug.body(player);
}

function addPlayer(self, playerInfo) {
    // console.log(`Player created at x: ${playerInfo.sp.x}, y: ${playerInfo.sp.y}`);
    // Creates a new player sprite with physics at the server generated random spawn and team
    self.player = self.physics.add.sprite(
        playerInfo.sp.x,
        playerInfo.sp.y,
        playerInfo.team
    );
    // self.player.name = playerInfo.username;
    // self.player.name = localStorage.getItem("username");

    if (localStorage.getItem("username")) {
        self.player.name = localStorage.getItem("username");
        self.socket.emit("updateUsername", {
            id: playerInfo.playerId,
            username: localStorage.getItem("username")
        });
    } else {
        self.player.name = playerInfo.username;
    }

    statusText.text(`Welcome ${self.player.name}!`);
    if (playerInfo.team == "human") {
        $("#killerAvatar").attr("src", "./assets/images/AH1.png");
    } else {
        $("#killerAvatar").attr("src", "./assets/images/AZ1.png");
    }

    self.player.setDataEnabled();
    // Assigns the username to the clients player based on username from server
    self.player.setData({
        // username: playerInfo.username,
        username: localStorage.getItem("username"),
        team: playerInfo.team,
        alive: true,
        kills: 0,
        deaths: 0
        // playerID: 
    });
    clientId = playerInfo.playerId;

    // Sets the hitbox for the player, and centers it false
    self.player.body.setSize(16, 10, false);
    // Offsets the players hitbox based on below params
    // x, y, width, height
    self.player.body.setOffset(0, 22, 16, 5);
    // Player name above head
    if (playerInfo.team == "human") {
        self.player.usernameText = self.add.text(
            self.player.x,
            self.player.y,
            self.player.name, {
                fontFamily: "Helvetica",
                fontSize: 12,
                color: "#0000FF",
                fontWeight: "bold"
            }
        );
    } else {
        self.player.usernameText = self.add.text(
            self.player.x,
            self.player.y,
            self.player.name, {
                fontFamily: "Helvetica",
                fontSize: 12,
                color: "#ff0044",
                fontWeight: "bold"
            }
        );
    }

    self.player.usernameText.x =
        self.player.x - self.player.usernameText.width / 2;
    self.player.usernameText.y = self.player.y - self.player.height + 5;

    // Ensures the text is above all the world layer but below the shroud layer
    self.player.usernameText.setDepth(25);
    // Prevents player from walking through collision layer
    self.physics.add.collider(self.player, collisionLayer);
    // Prevents player from walking off the map
    self.player.setCollideWorldBounds(true);
}

function addOtherPlayers(self, playerInfo) {
    otherPlayer = self.physics.add.sprite(
        playerInfo.sp.x,
        playerInfo.sp.y,
        playerInfo.team
    );
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.name = playerInfo.username;
    otherPlayer.alive = true;
    otherPlayer.kills = 0;
    otherPlayer.deaths = 0;
    self.otherPlayers.add(otherPlayer);

    if (playerInfo.team == "human") {
        otherPlayer.usernameText = self.add.text(
            playerInfo.x,
            playerInfo.y,
            playerInfo.username, {
                fontFamily: "Helvetica",
                fontSize: 12,
                color: "#0000FF",
                fontWeight: "bold"
            }
        );
    } else {
        otherPlayer.usernameText = self.add.text(
            playerInfo.x,
            playerInfo.y,
            playerInfo.username, {
                fontFamily: "Helvetica",
                fontSize: 12,
                color: "#ff0044",
                fontWeight: "bold"
            }
        );
    }

    otherPlayer.usernameText.x = otherPlayer.x - otherPlayer.usernameText.displayWidth / 2;
    otherPlayer.usernameText.y = otherPlayer.y - otherPlayer.height + 5;

    // Ensures the text is above all the world layer but below the shroud layer
    otherPlayer.usernameText.setDepth(25);
}

function headToHead(player, enemy) {
    // Player runs into another player, if the player is not part of the hunting team then player dies, if player is the hunting team and runs into another player the other player dies.
    if (player.data.values.team !== enemy.team) {
        if (player.data.values.team == huntTeam && enemy.team !== huntTeam) {
            this.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (otherPlayer.playerId == enemy.playerId) {
                    otherPlayer.alive = false;
                }
            });
            // console.log(`Enemy dies`);
            this.socket.emit("characterDies", {
                victim: enemy.playerId,
                attacker: clientId
            });

        } else if (player.data.values.team !== huntTeam && enemy.team == huntTeam) {
            // console.log(`Player dies`);
            self.player.data.values.alive = false;
            this.socket.emit("characterDies", {
                victim: clientId,
                attacker: enemy.playerId
            });
        }
    }
}

function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateLeaderboard(players) {
    var humanScores = [];
    var zombieScores = [];
    numHumans = 0;
    numZombies = 0;

    console.log(players);

    Object.keys(players).forEach(function (i) {
        if (players[i].team == "human") {
            humanScores.push(players[i]);
            numHumans++;
            $(`#HP${numHumans}`).html(
            `<img src="./assets/images/AH1.png" alt="Player Avatar" class="rounded-circle" style="width:20px; margin-left: 5px">
            </td>
            <td style="padding-left: 5px">${players[i].username}</td>
            <td>${players[i].score}</td>
            <td>${players[i].kills}</td>
            <td>${players[i].deaths}</td>`
            );
        } else if (players[i].team == "zombie") {
            zombieScores.push(players[i]);
            numZombies++;
            $(`#ZP${numZombies}`).html(
            `<img src="./assets/images/AZ1.png" alt="Player Avatar" class="rounded-circle" style="width:20px; margin-left: 5px">
            </td>
            <td style="padding-left: 5px">${players[i].username}</td>
            <td>${players[i].score}</td>
            <td>${players[i].kills}</td>
            <td>${players[i].deaths}</td>`
            );
        }
    });
}