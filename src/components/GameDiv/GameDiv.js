import React from "react";
import "./GameDiv.css";

const GameDiv = props => (
  <div className="card col-4 stopshow">
    <iframe src="game.html" height="480" width="640"></iframe>
  </div>
);

export default GameDiv;