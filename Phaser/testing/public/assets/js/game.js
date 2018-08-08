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
    this.load.spritesheet("human", "../assets/images/human.png", {
        frameWidth: 16,
        frameHeight: 32
    });
    this.load.spritesheet("zombie", "../assets/images/zombie.png", {
        frameWidth: 20, // 16px human, 20px zombie
        frameHeight: 32
    });
}

function create() {
    // Runs once, after all assets in preload are loaded
    let team = 'human';
    let bg = this.add.sprite(0, 0, 'background');

    bg.setOrigin(0, 0);

    player = this.physics.add.sprite(50, 50, team);

    player.setCollideWorldBounds(true);

    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers(team, {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "turn",
        frames: [{
            key: team,
            frame: 2
        }],
        frameRate: 20
    });

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers(team, {
            start: 6,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "up",
        frames: this.anims.generateFrameNumbers(team, {
            start: 9,
            end: 11
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "down",
        frames: this.anims.generateFrameNumbers(team, {
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
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
    } 

    if (player.body.velocity.x > 0) {
        player.anims.play("right", true);
    } else if (player.body.velocity.x < 0) {
        player.anims.play("left", true);
    }

    if (player.body.velocity.x == 0) {
        if (player.body.velocity.y < 0) {
            player.anims.play("up", true);
        } else if (player.body.velocity.y > 0) {
            player.anims.play("down", true);
        } else {
            player.anims.stop();
        }
    }
}