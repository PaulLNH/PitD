import React, { Component } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import './App.css';
import Wrapper from "./components/Wrapper";
import Modal from "./components/Modal";
import Button from "./components/Button";
import Canvas from "./components/Canvas";
import Live from "./components/Live";
import Overview from "./components/Overview";
import Video from "./components/Video";
import images from "./images.json"
// import ReactCursorPosition from 'react-cursor-position';
// import { height } from 'window-size';

class App extends Component {

  constructor(props) {
    super(props);
    // this.updateDraw=this.updateDraw.bind(this);
    this.state={
      show_modal: false,
      width: 0,
      height: 0,
      images
      // x: 0, 
      // y: 0
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    // this.updateDraw(event);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  showModal = () => {
    this.setState({show_modal:true});
  };

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  
  updateDraw = (event) => {

    const x = event.clientX;
    const y = event.clientY;

    // console.log(`x=${x}, y=${y}`)
    // console.log(`width = ${this.state.width}, height = ${this.state.height}`)
    // console.log(`x=${x}, y=${y}`)

    const ctx = document.getElementById("back");
    const ctxv = ctx.getContext("2d");
    let WIDTH = this.state.width;
    let HEIGHT = this.state.height;
    ctxv.width = WIDTH;
    ctxv.height = HEIGHT;

    // console.log(ctxv.width);
    // console.log(ctxv.height);

    // ctxv.scale(1,1);

    // ctxv.beginPath();
    // ctxv.lineWidth="4";
    // ctxv.strokeStyle="red";
    // ctxv.rect(5,5,100,100);
    // ctxv.stroke();

    // console.log(`Width = ${WIDTH}, Height = ${HEIGHT}`);
    let default_gco = ctxv.globalCompositeOperation;

    let vision_rd = 150;

    ctxv.clearRect(0, 0, WIDTH, HEIGHT);
    ctxv.globalAlpha = .7;
    ctxv.fillStyle = "black";
    ctxv.fillRect(0, 0, WIDTH, HEIGHT);
    ctxv.globalCompositeOperation = "destination-out";
    let dark_gd = ctxv.createRadialGradient(
        x,
        y,
        vision_rd,
        x,
        y,
        vision_rd / 1.5
    );
    dark_gd.addColorStop(0, "rgba(0,0,0,0");
    dark_gd.addColorStop(1, "rgba(0,0,0,1");
    ctxv.fillStyle = dark_gd;
    ctxv.beginPath();
    // console.log(`inner x =${x}, y =${y}`)
    ctxv.arc(x, y, vision_rd, 0, 2 * Math.PI);
    ctxv.closePath();
    ctxv.fill();
    ctxv.globalCompositeOperation = default_gco;
    // console.log(`x = ${x}, y = ${y}`);

  }

  

  render() {
    return (
      <div className="app" onMouseMove={(event) => this.updateDraw(event)}>
      <Canvas 
        width={this.state.width}
        height={this.state.height}
      />
      <Router>
        <Button
          // updateDraw={this.updateDraw}
          image={this.state.images}
          showModal={this.showModal}
        ></Button>
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
