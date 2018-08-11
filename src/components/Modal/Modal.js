import React from "react";
import "./Modal.css";

const Modal = props => (
    <div className="modal" id="noteModal" tabIndex="-1" role="dialog" aria-labelledby="noteModalLabel" aria-hidden="false">
        <div className="modal-dialog" role="document">
        <div className="modal-content">
            <div className="modal-header">
            <h4 className="modal-title" id="noteModalLabel">Modal title</h4>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="false">&times;</span>
            </button>
            </div>
            <div className="modal-body">
                <div id="sign-in" className="col">
                    <h2>Sign In</h2>
                    <form id="sign-in-form">
                        <div className="form-group">
                        <input type="text" className="form-control" id="sign-in-username"
                        placeholder="Username/Email"></input>
                        <input type="password" className="form-control" id="sign-in-password" placeholder="Password"></input>
                        <button type="submit" className="btn btn-success submit btn-md">Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            <button id="save-note" type="button" className="btn btn-primary" data-id="" data-dismiss="modal">Save changes</button>
            </div>
        </div>
        </div>
    </div>
);

export default Modal;