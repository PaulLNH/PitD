const client = new Colyseus.Client("ws://localhost:3553");
const room = colyseus.join('tictactoe');

room.onJoin.add(() => {
    console.log(`Client: ${room.sessionId} joined!`);
})

// let numPlayers = 0;
// this.room.listen("players/:id", (change) => {
//     numPlayers++;

//     if (numPlayers === 2) {
//         this.onJoin();
//     }
// });

// this.room.listen("currentTurn", (change) => {
//     if (change.operation === "replace") {
//         // go to next turn after a little delay, to ensure "onJoin" gets called before this.
//         setTimeout(() => this.nextTurn(change.value), 10)
//     }
// });

// this.room.listen("board/:x/:y", (change) => {
//     if (change.operation === "replace") {
//         this.board.set(change.path.x, change.path.y, change.value);
//     }
// });

// this.room.listen("draw", (change) => {
//     if (change.operation === "replace") {
//         this.drawGame();
//     }
// });

// this.room.listen("winner", (change) => {
//     if (change.operation === "replace") {
//         this.showWinner(change.value);
//     }
// });

// this.room.onError.addOnce(() => {
//     this.emit('goto', TitleScreen)
// });