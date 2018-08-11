// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"assets\\js\\game.js":[function(require,module,exports) {
// run 'http-server' in terminal to test

var config = {
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
var game = new Phaser.Game(config);

// Set to true to display collision debugging layer
var showDebug = false;
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
  var map = this.make.tilemap({
    key: "map",
    tileWidth: 16,
    tileHeight: 16
  });
  var tileset = map.addTilesetImage("tileset", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  var collisionLayer = map.createStaticLayer("collision", tileset, 0, 0);
  var belowLayer = map.createStaticLayer("below", tileset, 0, 0);
  var worldLayer = map.createStaticLayer("world", tileset, 0, 0);
  var aboveLayer = map.createStaticLayer("above", tileset, 0, 0);
  var aboveDecorLayer = map.createStaticLayer("aboveDecor", tileset, 0, 0);
  var decorLayer = map.createStaticLayer("decor", tileset, 0, 0);

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);
  aboveDecorLayer.setDepth(11);
  collisionLayer.setDepth(0);

  collisionLayer.setCollisionByProperty({
    collides: true
  }, true);

  // Debug collision //
  if (showDebug) {
    var debugGraphics = this.add.graphics().setAlpha(0.75);
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
  var teams = ["human", "zombie"];
  var team = teams[Math.round(Math.random())];

  // Max number of spawn points in array format (actual number -1)
  var spMax = 7;
  // Randomly select spawn point
  var sp1 = map.objects[0].objects[Math.floor(Math.floor(Math.random() * (spMax - 0 + 1)) + 0)];

  // Creates a new player at the spawnpoint location with the random team from above
  player = this.physics.add.sprite(sp1.x, sp1.y, team);
  player.username = "Paul";
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
  var speed = 100;
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
},{}],"..\\..\\..\\..\\..\\..\\Users\\plair\\AppData\\Roaming\\npm\\node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '60397' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["..\\..\\..\\..\\..\\..\\Users\\plair\\AppData\\Roaming\\npm\\node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js","assets\\js\\game.js"], null)
//# sourceMappingURL=/game.ed88cdfc.map