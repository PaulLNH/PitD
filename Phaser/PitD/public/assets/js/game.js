// run 'http-server' in terminal to test

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

// Instanciate a new game instance
const game = new Phaser.Game(config);
var collisionLayer;
const speed = 100;

// Set to true to display collision debugging layer
let showDebug = false;
// var username = "Paul";
// var usernameText;
// var spotlight;

//////////////////////// PRELOAD ///////////////////////////
// This runs once before anything else, loads up assets like images and audio
function preload() {
    this.load.image("tiles", "../assets/tilesets/tilesets.png");
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/map.json");
    // this.load.image("dark", "assets/sprites/dark.png");
    this.load.image("mask", "assets/sprites/mask.png");
    this.load.spritesheet("human", "../assets/sprites/human.png", {
        frameWidth: 16, // 16px human width
        frameHeight: 32
    });
    this.load.spritesheet("zombie", "../assets/sprites/zombie.png", {
        frameWidth: 20, // 20px zombie width
        frameHeight: 32
    });
}

//////////////////////// CREATE ///////////////////////////
// Loads elements into Phaser's cache (i.e. the name you used in preload)
function create() {
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
    this.otherPlayers = this.physics.add.group();
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });
    // this.socket.on('disconnect', function (playerId) {
    //     self.otherPlayers.getChildren().forEach(function (otherPlayer) {
    //         if (playerId === otherPlayer.playerId) {
    //             otherPlayer.destroy();
    //         }
    //     });
    // });

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    ///// START ANIMATIONS ////
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers(this.player.team, {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "turn",
        frames: [{
            key: this.player.team,
            frame: 2
        }],
        frameRate: 20
    });

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers(self.player.team, {
            start: 6,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "up",
        frames: this.anims.generateFrameNumbers(self.player.team, {
            start: 9,
            end: 11
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "down",
        frames: this.anims.generateFrameNumbers(self.player.team, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });
    //// END ANIMATIONS ////

    // Darkness mask
    // var dark = this.add.image(0, 0, "dark");
    // dark.setDepth(30);
    // spotlight = this.make.sprite({
    //     x: 0,
    //     y: 0,
    //     key: "mask",
    //     add: false
    // });
    // spotlight.setScale(0.5);
    // dark.mask = new Phaser.Display.Masks.BitmapMask(this, spotlight);

    // Attach the mask to the pointer
    // this.input.on('pointermove', function (pointer) {
    //     spotlight.x = pointer.x;
    //     spotlight.y = pointer.y;
    // });
}

function update() {
    // console.log(JSON.stringify(this.player));
    // this.player returns: 
    // {
    //     "name": "",
    //     "type": "Sprite",
    //     "x": 163,
    //     "y": 92,
    //     "depth": 0,
    //     "scale": {
    //         "x": 1,
    //         "y": 1
    //     },
    //     "origin": {
    //         "x": 0.5,
    //         "y": 0.5
    //     },
    //     "flipX": false,
    //     "flipY": false,
    //     "rotation": 0,
    //     "alpha": 1,
    //     "visible": true,
    //     "scaleMode": 0,
    //     "blendMode": 0,
    //     "textureKey": "zombie",
    //     "frameKey": 0,
    //     "data": {}
    // }

    if (this.player) {
        // Default velocity is 0 (stopped)
        this.player.body.velocity.set(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        if (this.player.body.velocity.x > 0) {
            self.player.anims.play("right", true);
        } else if (this.player.body.velocity.x < 0) {
            self.player.anims.play("left", true);
        }

        if (this.player.body.velocity.x == 0) {
            if (this.player.body.velocity.y < 0) {
                self.player.anims.play("up", true);
            } else if (this.player.body.velocity.y > 0) {
                self.player.anims.play("down", true);
            } else {
                self.player.anims.stop();
            }
        }

        // Prevents character from moving faster while pressing two directions
        this.player.body.velocity.normalize().scale(speed);

        // emit player movement
        var x = this.player.x;
        var y = this.player.y;
        if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
            this.socket.emit('playerMovement', {
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

    /////////////// SAMPLE CODE:
    // if (this.player) {
    //     if (this.cursors.left.isDown) {
    //         this.player.setAngularVelocity(-150);
    //     } else if (this.cursors.right.isDown) {
    //         this.player.setAngularVelocity(150);
    //     } else {
    //         this.player.setAngularVelocity(0);
    //     }

    //     if (this.cursors.up.isDown) {
    //         this.physics.velocityFromRotation(this.player.rotation + 1.5, 100, this.player.body.acceleration);
    //     } else {
    //         this.player.setAcceleration(0);
    //     }

    //     this.physics.world.wrap(this.player, 5);

    //     // emit player movement
    //     var x = this.player.x;
    //     var y = this.player.y;
    //     if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
    //         this.socket.emit('playerMovement', {
    //             x: this.player.x,
    //             y: this.player.y
    //         });
    //     }
    //     // save old position data
    //     this.player.oldPosition = {
    //         x: this.player.x,
    //         y: this.player.y
    //     };
    // }
}

//////////////////////// UPDATE (GAME LOOP) ///////////////////////////
// Runs once per frame for the duration of the scene
// function update(time, delta) {

//     console.log(`Update this: ${this.player}`);
//     let speed = 100;
//     cursors = this.input.keyboard.createCursorKeys();

//     usernameText.x = Math.floor(this.player.x - usernameText.width / 2);
//     usernameText.y = Math.floor(player.y - player.height + 5);
//     spotlight.x = player.x;
//     spotlight.y = player.y;

//     // Default velocity is 0 (stopped)
//     player.body.velocity.set(0);
//     if (cursors.left.isDown) {
//         player.setVelocityX(-speed);
//     } else if (cursors.right.isDown) {
//         player.setVelocityX(speed);
//     }

//     if (cursors.up.isDown) {
//         player.setVelocityY(-speed);
//     } else if (cursors.down.isDown) {
//         player.setVelocityY(speed);
//     }

//     if (player.body.velocity.x > 0) {
//         player.anims.play("right", true);
//     } else if (player.body.velocity.x < 0) {
//         player.anims.play("left", true);
//     }

//     if (player.body.velocity.x == 0) {
//         if (player.body.velocity.y < 0) {
//             player.anims.play("up", true);
//         } else if (player.body.velocity.y > 0) {
//             player.anims.play("down", true);
//         } else {
//             player.anims.stop();
//         }
//     }
//     // Prevents character from moving faster while pressing two directions
//     player.body.velocity.normalize().scale(speed);

//     ///// END PLAYER CONTROLLER /////
// }

function render() {
    game.debug.bodyInfo(player, 32, 32);
    game.debug.body(player);
}

function addPlayer(self, playerInfo) {
    // console.log(`addPlayer playerInfo: ${JSON.stringify(playerInfo)}`);
    // Creates a new player sprite with physics at the server generated random spawn and team
    self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.team);
    // Assigns the username to the clients player based on username from server
    // self.player.username = playerInfo.username;
    console.log(`Username: ${playerInfo.username}`);
    // Sets the hitbox for the player, and centers it false
    self.player.body.setSize(16, 10, false);
    // Offsets the players hitbox based on below params
    // x, y, width, height
    self.player.body.setOffset(0, 22, 16, 5);

    // Player name above head
    self.player.usernameText = self.add.text(playerInfo.x, playerInfo.y, self.player.username, {
        fontFamily: "Helvetica",
        fontSize: 12,
        color: "#ff0044",
        fontWeight: "bold"
    });
    // Ensures the text is above all the world layer but below the shroud layer
    self.player.usernameText.setDepth(25);
    // Prevents player from walking through collision layer
    self.physics.add.collider(self.player, collisionLayer);
    // Prevents player from walking off the map
    self.player.setCollideWorldBounds(true);
    // Logs what the new player body is
    // console.log(self.player.body);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.team);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}