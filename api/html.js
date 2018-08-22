var path = require("path");

module.exports = function(app) {

  app.get("/sign-in", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/sign-in.html"));
  });

  app.get("/sign-up", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/sign-up.html"));
  });

  app.get("/sign-in", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/sign-in.html"));
  });

  app.get("/admin", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/admin.html"));
  });

  app.get("/game", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/game.html"));
  });

//   app.get("/sign-up", function(req, res) {
//     res.sendFile(path.join(__dirname, "../public/sign-up.html"));
//   });

//   app.get("/leaderboard", function(req, res) {
//     res.sendFile(path.join(__dirname, "../public/leaderboard.html"));
//   });
  
//   app.get("/admin", function(req, res) {
//     res.sendFile(path.join(__dirname, "../public/admin.html"));
//   });
};
