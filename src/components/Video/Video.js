import React from "react";
import "./Video.css";

const Video = props => (
  <div className="vid">
      <video width="400" height="300" controls><source src="" type="video/mp4"></source></video>
  </div>
);

// https://www.youtube.com/watch?v=TIKfXjxwWM0

export default Video;