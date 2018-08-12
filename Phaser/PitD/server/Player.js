/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (id, username, team, created) {
    var self = {
        id: id,
        username: username,
        team: team,
        living: true,
        score: 0,
        kills: 0,
        deaths: 0,
        timePlayed = () => {
            return 
          }
    };
  
    // Define which variables and methods can be accessed
    return {
      getX: getX,
      getY: getY,
      getAngle: getAngle,
      setX: setX,
      setY: setY,
      setAngle: setAngle,
      id: id
    }
  }
  
  // Export the Player class so you can use it in
  // other files by using require("Player")
  module.exports = Player