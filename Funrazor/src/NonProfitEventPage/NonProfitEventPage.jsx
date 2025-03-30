import './NonProfitEventPage.css'
import {useState} from 'react';
import RSVPDashboard from "../RSVPDashboard/RSVPDashboard.jsx";
import {useAuth0} from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom'; 

function NonProfitEventPage({event}) {
	const {user, isAuthenticated} = useAuth0();
	const history = useHistory();
	const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

	function closeModal() {
		setIsModalOpen(false);
	}

	return (
		<div className="non-profit-event-page">
			<div id="event-header">
				<h1 id="event-name">{event.name}</h1>
				<div id="event-progress-container">
					<span id="event-progress-text">Donations: ${event.donationTotal?.toFixed(2)} / ${event.donationGoal?.toFixed(2)}</span>
					<progress 
						value={event.donationGoal > 0 ? (event.donationTotal / event.donationGoal) * 100 : 0} 
						max="100" 
						id="event-progress-bar"
					></progress>
				</div>
			</div>
			<div id="back-button-container">
                <button
                    onClick={() => history.push('/')}
                    className="bg-gray-500 text-white p-2 rounded-lg mt-4"
                >
                    Back to Home
                </button>
            </div>
			<h2 id="about-text">
				<strong>About Our Event</strong>
			</h2>
			<div id="body-container">
				<div id="event-body">
					<div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
					<div><strong>RSVPs:</strong> {event.rsvpResponses ? event.rsvpResponses.length : 0}</div>
					<div>{event.description}</div>
				</div>
				<div id="rsvp-button-container">
					<button style = {{backgroundColor: "#007bff"}} id="rsvp-button" onClick={() => setIsModalOpen(true)}>RSVP Information</button>
				</div>
			</div>

			{isModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content">
						<RSVPDashboard event={event}/>
						<button id="close-modal" onClick={closeModal}>Close</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default NonProfitEventPage;
