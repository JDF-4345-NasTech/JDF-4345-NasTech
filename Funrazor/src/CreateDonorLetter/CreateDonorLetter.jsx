import {useState} from 'react';
import {useAuth0} from "@auth0/auth0-react";
import { useHistory } from 'react-router-dom'; 
import "./CreateDonorLetter.css";

function CreateDonorLetter() {
	const {user, isAuthenticated, isLoading} = useAuth0();

    console.log('starting2');
    return (
        <div className="non-profit-event-page">
			<div id="npe-event-header">
                <h2>HI</h2>
            </div>
            <div id="body-container">
                <p id="non-profit-details">Hello Whirled</p>
            </div>
        </div>
    );
};


export default CreateDonorLetter;