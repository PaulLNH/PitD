// For each player that moves it sends data to the server about it's movement
// The server stores the old values and the new values and packages it up into
// a playerMoved broadcast with that players key and the players object
// Receive playerMoved notification from server
// playerInfo = players[socket.id] from the moving player
this.socket.on("playerMoved", function (playerInfo) {
    // gets list of all other players, iterates through them and passes otherPlayer
    // as a parameter in the callback function
    this.otherPlayers.getChildren().forEach(function (otherPlayer) {
        // Match the playerInfo.playerId from the socket broadcast
        // to the otherPlayer.playerId so the client knows which player to move
        if (playerInfo.playerId === otherPlayer.playerId) {
            // this.player is moving right
            if (this.player.body.velocity.x > 0) {
                if (this.player.data.values.team == "human") {
                    this.player.anims.play("humanRight", true);
                } else {
                    this.player.anims.play("zombieRight", true);
                }
                // this.player is moving left
            } else if (this.player.body.velocity.x < 0) {
                if (this.player.data.values.team == "human") {
                    this.player.anims.play("humanLeft", true);
                } else {
                    this.player.anims.play("zombieLeft", true);
                }
            }

            // this.player is not moving left or right
            if (this.player.body.velocity.x == 0) {
                // this.player is moving up
                if (this.player.body.velocity.y < 0) {
                    if (this.player.data.values.team == "human") {
                        this.player.anims.play("humanUp", true);
                    } else {
                        this.player.anims.play("zombieUp", true);
                    }
                    // this.player is moving down
                } else if (this.player.body.velocity.y > 0) {
                    if (this.player.data.values.team == "human") {
                        this.player.anims.play("humanDown", true);
                    } else {
                        this.player.anims.play("zombieDown", true);
                    }
                    // this.player is not moving left, right, up or down
                } else {
                    this.player.anims.stop();
                }
            }
        }
    });
});