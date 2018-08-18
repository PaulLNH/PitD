var path = require("path");

module.exports = function(app) {

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/welcome.html"));
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
