
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