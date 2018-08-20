var db = require("../models");

module.exports = function(app) {

  /* Psuedo routes
    





  */

  app.get("/api/highscores/", function(req, res) {
    db.User.findAll({})
      .then(function(dbUser) {
        res.json(dbUser);
      });
  });

  app.get("/api/usersAdmin/", function(req, res) {
    db.User.findAll({})
      .then(function(dbUser) {
        res.json(dbUser);
      });
  });

  app.delete("/api/usersDelete/:id", function(req, res) {
    db.User.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(function(dbUser) {
        res.json(dbUser);
      });
  });

  app.get("/api/users/login/:username", function(req, res) {
    db.User.findOne({
      where: {
        username: req.params.username
      }
    })
      .then(function(dbUser) {
        res.json(dbUser);
      });
  });

  app.post("/api/users", function(req, res) {
    console.log(req.body);
    db.User.create({
      username: req.body.username,
      password: req.body.password
    })
      .then(function(dbUser) {
        res.json(dbUser);
      });
  });

  app.get("/api/users/:id", function(req, res) {
    console.log(req.params.id);
    db.User.findOne({
      where: {
        id: req.params.id
      }
    })
      .then(function(dbUser) {
        res.json(dbUser);
      });
  });
};
