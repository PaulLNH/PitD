// run 'http-server' in terminal to test

const config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 640, // Canvas width in pixels (usually 800) - 171 /w mario tile example
    height: 480, // Canvas height in pixels (usually 600) - 160 /w mario tile example
    zoom: 1, // Since we're working with 16x16 pixel tiles, let's scale up the canvas by 3x
    pixelArt: true, // Force the game to scale images up crisply
    parent: "game-container", // ID of the DOM element to add the canvas to
    scene: {
        preload: preload,
        create: create,
        update: update
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

function preload() {
    // Runs once, loads up assets like images and audio
    this.load.image('background', '../assets/images/background.png');
    this.load.image("mario-tiles", "../assets/tilesets/super-mario-tiles.png");
    this.load.spritesheet("human", "../assets/images/human.png", {
        frameWidth: 16,
        frameHeight: 32
    });
}

function create() {
    // Runs once, after all assets in preload are loaded

    let bg = this.add.sprite(0, 0, 'background');

    bg.setOrigin(0, 0);

    // const level = [
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 1, 2, 3, 0, 0, 0, 1, 2, 3, 0],
    //     [0, 5, 6, 7, 0, 0, 0, 5, 6, 7, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 14, 13, 14, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 14, 14, 14, 14, 14, 0, 0, 0, 15],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 15],
    //     [35, 36, 37, 0, 0, 0, 0, 0, 15, 15, 15],
    //     [39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39]
    // ];

    // // When loading from an array, make sure to specify the tileWidth and tileHeight
    // const map = this.make.tilemap({
    //     data: level,
    //     tileWidth: 16,
    //     tileHeight: 16
    // });
    // const tiles = map.addTilesetImage("mario-tiles");
    // const layer = map.createStaticLayer(0, tiles, 0, 0);

    player = this.physics.add.sprite(50, 50, "human");

    player.setCollideWorldBounds(true);

    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("human", {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "turn",
        frames: [{
            key: "human",
            frame: 2
        }],
        frameRate: 20
    });

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("human", {
            start: 6,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "up",
        frames: this.anims.generateFrameNumbers("human", {
            start: 9,
            end: 11
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "down",
        frames: this.anims.generateFrameNumbers("human", {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });
}

function update(time, delta) {
    let speed = 100;
    cursors = this.input.keyboard.createCursorKeys();
    player.body.velocity.set(0);

    // Runs once per frame for the duration of the scene
    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.anims.play("left", true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.anims.play("right", true);
    } 
    // else {
    //     player.setVelocityX(0);
    // }

    if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        player.anims.play("up", true);
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        player.anims.play("down", true);
    } 
    // else {
    //     player.setVelocityY(0);
    // }

    // if (cursors.up.isDown && (cursors.left.isDown || cursors.right.isDown)) {
    //     player.anims.play("up", true);
    // } else if (cursors.down.isDown && (cursors.left.isDown || cursors.right.isDown)) {
    //     player.anims.play("down", true);
    // }



    // if (this.cursors.left.isDown) {
    //     this.ship.setAngularVelocity(-150);
    // } else if (this.cursors.right.isDown) {
    //     this.ship.setAngularVelocity(150);
    // } else {
    //     this.ship.setAngularVelocity(0);
    // }

    // if (this.cursors.up.isDown) {
    //     this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
    // } else {
    //     this.ship.setAcceleration(0);
    // }

    // var x = this.ship.x;
    // var y = this.ship.y;
    // var r = this.ship.rotation;
    // if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
    //     this.socket.emit('playerMovement', {
    //         x: this.ship.x,
    //         y: this.ship.y,
    //         rotation: this.ship.rotation
    //     });
    // }
    // this.ship.oldPosition = {
    //     x: this.ship.x,
    //     y: this.ship.y,
    //     rotation: this.ship.rotation
    // };

}