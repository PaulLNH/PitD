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
var usernameText;
var spotlight;

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
    this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
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
    });

    this.socket.on("disconnect", function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

    this.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
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

    // Darkness mask
    var dark = self.add.image(0, 0, "dark");
    dark.setDepth(30);
    spotlight = self.make.sprite({
        x: 0,
        y: 0,
        key: "mask",
        add: false
    });
    spotlight.setScale(0.5);
    dark.mask = new Phaser.Display.Masks.BitmapMask(self, spotlight);
}

function update() {
    if (this.player) {
        // Default velocity is 0 (stopped)
        this.player.body.velocity.set(0);
        if (this.cursors.left.isDown || this.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.down.isDown) {
            this.player.setVelocityY(speed);
        }

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

        // emit player movement
        var x = this.player.x;
        var y = this.player.y;
        if (
            this.player.oldPosition &&
            (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)
        ) {
            this.socket.emit("playerMovement", {
                oldX: this.player.oldPosition.x,
                oldY: this.player.oldPosition.y,
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
    // Creates a new player sprite with physics at the server generated random spawn and team
    self.player = self.physics.add.sprite(
        playerInfo.x,
        playerInfo.y,
        playerInfo.team
    );
    self.player.setDataEnabled();
    // Assigns the username to the clients player based on username from server
    self.player.setData({
        username: playerInfo.username,
        team: playerInfo.team
    });
    // Sets the hitbox for the player, and centers it false
    self.player.body.setSize(16, 10, false);
    // Offsets the players hitbox based on below params
    // x, y, width, height
    self.player.body.setOffset(0, 22, 16, 5);
    // Player name above head
    self.player.usernameText = self.add.text(
        playerInfo.x,
        playerInfo.y,
        self.player.name, {
            fontFamily: "Helvetica",
            fontSize: 12,
            color: "#ff0044",
            fontWeight: "bold"
        }
    );
    // Ensures the text is above all the world layer but below the shroud layer
    self.player.usernameText.setDepth(25);
    // Prevents player from walking through collision layer
    self.physics.add.collider(self.player, collisionLayer);
    // Prevents player from walking off the map
    self.player.setCollideWorldBounds(true);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.sprite(
        playerInfo.x,
        playerInfo.y,
        playerInfo.team
    );
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}