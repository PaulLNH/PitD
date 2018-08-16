import React from "react";
import "./Video.css";
// import {intro} from '../../assets/images/intro.mp4';

const Video = props => {
  // console.log(intro);
  return (
    <div className="vid">
      <iframe width="400" height="300" src="https://www.youtube.com/embed/TIKfXjxwWM0" allow="autoplay; encrypted-media"></iframe>
      {/* <video width="400" height="300" controls><source src={intro} type="video/mp4"></source></video> */}
    </div>
  )
};



// https://www.youtube.com/watch?v=TIKfXjxwWM0

export default Video;