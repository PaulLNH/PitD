import React from "react";
import "./Canvas.css";

const Canvas = props => {
  // console.log(props);
  // console.log(props.updateDraw);
  // console.log(props);
  // let width = props.width;
  return (
    <div>
      <canvas id="back" width={props.width} height={props.height}>
      </canvas>
    </div>
  )
};
// onMouseMove={() => props.updateDraw}

// function draw(data, i) {
//     let x = data.player[i].x;
//     let y = data.player[i].y;

//     let default_gco = ctx.globalCompositeOperation;
//     ctxv.clearRect(0, 0, 640, 480);
//     ctxv.globalAlpha = darkness;
//     ctxv.fillStyle = dark_color;
//     ctxv.fillRect(0, 0, WIDTH, HEIGHT);
//     ctxv.globalCompositeOperation = "destination-out";
//     let dark_gd = ctxv.createRadialGradient(
//         x,
//         y,
//         vision_rd,
//         x,
//         y,
//         vision_rd / 1.75
//     );
//     dark_gd.addColorStop(0, "rgba(0,0,0,0");
//     dark_gd.addColorStop(1, "rgba(0,0,0,1");
//     ctxv.fillStyle = dark_gd;
//     ctxv.beginPath();
//     ctxv.arc(x, y, vision_rd, 0, 2 * Math.PI);
//     ctxv.closePath();
//     ctxv.fill();
//     ctxv.globalCompositeOperation = default_gco;
// }

export default Canvas;