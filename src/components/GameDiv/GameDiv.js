import React from "react";
import "./GameDiv.css";

const GameDiv = props => (
  <div className="card text-align-center">
    <iframe width="800" height="800" src="./game.html"></iframe>
  </div>
);

export default GameDiv;