import React from "react";
import "./Button.css";
// import anon from "../../src/assets/images/anon.png"

const Button = props => {
    // console.log(props.image[0].image);
    return (
        <ul className="nav nav-tabs text-center">
            {/* onMouseMove={() => props.updateDraw()} */}
            <li className="col-3 img-container" onClick={() => props.showModal()}>
                {/* <i class="fas fa-user"></i> */}
                
                <img alt={props.name} src={props.image[0].image}/>
                <button className="btn buttonDiv">Login</button>
            </li>
            <li className="col-6"><header>Panic in the Dark</header></li>
            <li className="col-3">
                <div className="buttonDiv">
                    <button className="btn {props.showGame ? 'disabled' : ''}" onClick={() => props.playGame()}>Play Now!</button>
                </div>
            </li>
        </ul>
    )
};

export default Button;