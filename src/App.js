import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import Wrapper from "./components/Wrapper";
import Modal from "./components/Modal";
import Button from "./components/Button";
import Canvas from "./components/Canvas";
import Live from "./components/Live";
import Overview from "./components/Overview";
import Video from "./components/Video";
// import { height } from 'window-size';

class App extends Component {

 // Setting this.state.friends to the friends json array
  constructor(props) {
    super(props);
    this.state={
      show_modal: false
    }
  
  };

  showModal = () => {
    this.setState({show_modal:true});
    console.log('here here');
  };

  updateDraw = () => {
    // console.log("here")
      var ctx = document.getElementById("back");
      var ctxv = ctx.getContext("2d");
      // console.log(ctxv);
      var WIDTH = ctx.offsetWidth;
      var HEIGHT = ctx.offsetHeight;
      // console.log(WIDTH);
      // console.log(HEIGHT);

      ctxv.clearRect(0, 0, WIDTH, HEIGHT);
      ctxv.globalAlpha = 0.5;
      ctxv.fillStyle = "black";
      ctxv.fillRect(0, 0, WIDTH, HEIGHT);



      
      // ctxv.globalAlpha = darkness;
      // ctxv.fillStyle = dark_color;
      // ctxv.globalCompositeOperation


      // function draw(data, i) {
      //   let x = data.player[i].x;
      //   let y = data.player[i].y;
    
      //   let default_gco = ctx.globalCompositeOperation;
      //   ctxv.clearRect(0, 0, 640, 480);
      //   ctxv.globalAlpha = darkness;
      //   ctxv.fillStyle = dark_color;
      //   ctxv.fillRect(0, 0, WIDTH, HEIGHT);
      //   ctxv.globalCompositeOperation = "destination-out";
      //   let dark_gd = ctxv.createRadialGradient(
      //       x,
      //       y,
      //       vision_rd,
      //       x,
      //       y,
      //       vision_rd / 1.75
      //   );
      //   dark_gd.addColorStop(0, "rgba(0,0,0,0");
      //   dark_gd.addColorStop(1, "rgba(0,0,0,1");
      //   ctxv.fillStyle = dark_gd;
      //   ctxv.beginPath();
      //   ctxv.arc(x, y, vision_rd, 0, 2 * Math.PI);
      //   ctxv.closePath();
      //   ctxv.fill();
      //   ctxv.globalCompositeOperation = default_gco;
    // }
  }

  render() {
    return (
      <div className="app" onMouseMove={() => this.updateDraw()}>

      <Canvas 
      updateDraw={this.updateDraw}
      />
      <Router>
        <Button
        updateDraw={this.updateDraw}
        showModal={this.showModal}
        >Login</Button>
      </Router>
      {this.state.show_modal && <Modal/>}
      <Wrapper className="screen">
        <div className="video"><Video/>
        </div>
        <div className="bottom row">
          <div className="col-6 mx-auto stats"><Overview/></div>
          <div className="col-6 mx-auto stats"><Live/></div>
        </div>
      </Wrapper>
      </div>
    );
  }
}

export default App;
