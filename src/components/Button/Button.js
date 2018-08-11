import React from "react";
import "./Button.css";

const Button = props => (
    <ul className="nav nav-tabs text-center">
    {/* onMouseMove={() => props.updateDraw()} */}
        <li className="col-3 img-container" onClick={() => props.showModal()}>Login
            <img alt={props.name} src={props.image} />
        </li>
        <li className="col-6"><header>Panic in the Dark</header></li>
        <li className="col-3">
            <div className="buttonDiv">
                <button className="btn">Play Now!</button>
            </div>
        </li>
    </ul>
);

export default Button;