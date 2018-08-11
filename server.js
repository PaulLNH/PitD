const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jwt-express');
const env = process.env.NODE_ENV || "development";
const config = require(`${__dirname}/config/config.json`)[env];

const PORT = process.env.PORT || 8080;
const app = express();
const db = require("./models");
// Express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(jwt.init(config.tokenSecret, {
  cookies: false
}));
app.use((err, req, res, next) => {
  console.log(`${req.method} ${req.url} - ${err.message}`);

  if (err.name == 'JWTExpressError') err.status = 401;

  res.status(err.status || 400).send({message: `${err.message}`});
});

// Api routes
require("./api/account.js")(app);
// require("./api/game.js")(app);
require("./api/admin.js")(app);
require("./api/html.js")(app);

// Sync sequelize and start http server
db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});