var db = require("../models");
const Op = require('sequelize').Op;
const jwt = require('jwt-express');

module.exports = (app) => {

  // Read all accounts
  app.get("/api/accounts/all", function(req, res) {
    // console.log("getting all");
    db.Account.findAll({})
      .then(function(dbAccount) {
        // console.log(dbAccount);
        res.json(dbAccount);
      });
  });

  app.post("/api/accounts/add", async(req, res) => {
    // console.log(req.body);
    let account = await db.Account.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    });
    // console.log(account);
    res.status(200).send(account);
  });

  app.post("/api/accounts/login", async(req, res, next) => {
    // console.log(req.body);
    try {
      let account = await db.Account.findOne({
        where: {
          [Op.or]: [
            {email: req.body.username},
            {username: req.body.username}
          ]
        }
      });

      let valid = await account.validPassword(req.body.password);

      if (!valid) {
        
        next({status: 401, message: 'Username/Password Wrong'});
      }

      res.status(200).send(res.jwt({
        
        id: account.id,
        username: account.username
      }));
    } catch (error) {
      console.log(error);
      next({status: 401, message: 'Username/Password Wrong'});
    }
  });

  // Update account data after "Game Over"
  // app.put("/api/accounts/update", function(req, res) {
  //   // console.log(req.params.id);

  //   db.Account.findOne({
  //     where: {
  //       id: 6
  //     }
  //   }).then(function (account) {
  //     console.log(account);

  //     let wins = account.wins;
  //     let losses = account.losses;
  //     const kills = account.kills;
  //     const deaths = account.deaths;
  //     const highscore = account.highscore;
  //     const lastplayed = account.lastplayed;
  //     const timeplayed = account.timeplayed

  //     // increment wins or losses
  //     if (req.body.won) wins++;
  //     else losses++;

  //     account.update(
  //       {wins: wins},
  //       {losses: losses},
  //       {kills: kills},
  //       {deaths: deaths},
  //       {highscore: highscore},
  //       {lastplayed: lastplayed},
  //       {timeplayed: timeplayed}
  //     )
  //     .then(function(dbAccount) {
  //       res.json(dbAccount);
  //     });
  //   });
  // });

  // Update account stats
  app.get("/api/accounts/:id", function(req, res) {
    db.Account.findOne({
      where: {
        id: req.params.id
      }
    })
      .then(function(dbAccount) {
        res.json(dbAccount);
      });
  });

  // Delete
  app.delete("/api/accounts/delete:id", function(req, res) {
    db.Account.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(function(dbAccount) {
        res.json(dbAccount);
      });
  });
};
