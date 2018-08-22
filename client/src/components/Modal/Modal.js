import React from "react";
import "./Modal.css";

const Modal = props => (
    <div className="modal" id="noteModal" tabIndex="-1" role="dialog" aria-labelledby="noteModalLabel" aria-hidden="false">
        <div className="modal-dialog" role="document">
        <div className="modal-content">
            {/* <div className="modal-header">
            <h4 className="modal-title" id="noteModalLabel">Modal title</h4>
            
            </div> */}
            <div className="modal-body">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="false">&times;</span>
                </button>
                <div id="sign-in" className="col">
                    <h2>Sign In</h2>
                    <form id="sign-in-form">
                        <div className="form-group">
                        <input type="text" className="form-control" id="sign-in-username"
                        placeholder="Username/Email"></input>
                        <input type="password" className="form-control" id="sign-in-password" placeholder="Password"></input>
                        <button type="submit" className="btn btn-danger submit btn-md">Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <div id="sign-up" className="col">
                    <h2>Sign Up</h2>
                    <form id="sign-up-form">
                        <div className="form-group">
                        <input type="text" className="form-control" id="sign-up-username"
                        placeholder="Username/Email"></input>
                        <input type="password" className="form-control" id="sign-up-password" placeholder="Password"></input>
                        <button type="submit" className="btn btn-danger submit btn-md">Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </div>
    </div>
);

export default Modal;