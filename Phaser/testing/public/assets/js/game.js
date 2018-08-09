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

// Set to true to display collision debugging layer
let showDebug = false;
var username = "Paul";
var usernameText;
var spotlight;

//////////////////////// PRELOAD ///////////////////////////
// This runs once before anything else, loads up assets like images and audio
function preload() {
  this.load.image("tiles", "../assets/tilesets/tilesets.png");
  this.load.tilemapTiledJSON("map", "../assets/tilemaps/map.json");
  this.load.image("dark", "assets/sprites/dark.png");
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
  const collisionLayer = map.createStaticLayer("collision", tileset, 0, 0);
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

  collisionLayer.setCollisionByProperty(
    {
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
  // Generates a random team (for testing)
  let teams = ["human", "zombie"];
  let team = teams[Math.round(Math.random())];

  // Max number of spawn points in array format (actual number -1)
  let spMax = 7;
  // Randomly select spawn point
  const sp1 =
    map.objects[0].objects[
      Math.floor(Math.floor(Math.random() * (spMax - 0 + 1)) + 0)
    ];

  // Creates a new player at the spawnpoint location with the random team from above
  player = this.physics.add.sprite(sp1.x, sp1.y, team);
  player.body.setSize(16, 10, false);
  // x, y, width, height
  player.body.setOffset(0, 22, 16, 5);

  // Player name above head
  usernameText = this.add.text(player.body.x, player.body.y, username, {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#ff0044",
    fontWeight: "bold"
  });
  usernameText.setDepth(25);

  this.physics.add.collider(player, collisionLayer);

  player.setCollideWorldBounds(true);
  console.log(player.body);

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
    frames: [
      {
        key: team,
        frame: 2
      }
    ],
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

  // Darkness mask
  var dark = this.add.image(0, 0, "dark");
  dark.setDepth(30);
  spotlight = this.make.sprite({
    x: 0,
    y: 0,
    key: "mask",
    add: false
  });
  spotlight.setScale(0.5);
  dark.mask = new Phaser.Display.Masks.BitmapMask(this, spotlight);

  // Attach the mask to the pointer
  // this.input.on('pointermove', function (pointer) {
  //     spotlight.x = pointer.x;
  //     spotlight.y = pointer.y;
  // });
}

//////////////////////// UPDATE (GAME LOOP) ///////////////////////////
// Runs once per frame for the duration of the scene
function update(time, delta) {
  let speed = 100;
  cursors = this.input.keyboard.createCursorKeys();

  usernameText.x = Math.floor(player.x - usernameText.width / 2);
  usernameText.y = Math.floor(player.y - player.height + 5);
  spotlight.x = player.x;
  spotlight.y = player.y;

  // Default velocity is 0 (stopped)
  player.body.velocity.set(0);
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
  // Prevents character from moving faster while pressing two directions
  player.body.velocity.normalize().scale(speed);

  ///// END PLAYER CONTROLLER /////
}

function render() {
  game.debug.bodyInfo(player, 32, 32);

  game.debug.body(player);
}
