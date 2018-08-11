import React from "react";
import "./Video.css";

const Video = props => (
  <div className="vid">
      <video width="400" height="300" controls><source src="https://www.youtube.com/watch?v=TIKfXjxwWM0" type="video/mp4"></source></video>
  </div>
);

export default Video;