import './NonProfitEventPage.css'
import {useState} from 'react';
import RSVPDashboard from "../RSVPDashboard/RSVPDashboard.jsx";
import DonationDashboard from '../Donate/DonationDashboard/DonationDashboard';
import {useAuth0} from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom'; 

function NonProfitEventPage({event}) {
	const {user, isAuthenticated} = useAuth0();
	const history = useHistory();
	const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
	const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

	function closeRSVPModal() {
		setIsRSVPModalOpen(false);
	}

	function closeDonationModal() {
		setIsDonationModalOpen(false);
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
                    Home
                </button>
            </div>
			<h2 id="about-text">
				<strong>About</strong>
			</h2>
			<div id="body-container">
				<div id="event-body">
					<div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
					<div><strong>RSVPs:</strong> {event.rsvpResponses ? event.rsvpResponses.length : 0}</div>
					<div>{event.description}</div>
					</div>
					<div id="button-container">
					{/* RSVP Button */}
					<button
						style={{ backgroundColor: "#007bff" }}
						id="rsvp-button"
						onClick={() => setIsRSVPModalOpen(true)}
					>
						RSVP Information
					</button>
					{/* Donation Button */}
					<button
						style={{ backgroundColor: "#007bff" }}
						id="donation-button"
						onClick={() => setIsDonationModalOpen(true)}
					>
						Donation Details
					</button>
					</div>
				</div>

				{/* RSVP Modal */}
				{isRSVPModalOpen && (
					<div className="modal-overlay">
					<div className="modal-content">
						<RSVPDashboard event={event} />
						<button id="close-modal" onClick={closeRSVPModal}>Close</button>
					</div>
					</div>
				)}

				{/* Donation Modal */}
				{isDonationModalOpen && (
					<div className="modal-overlay">
					<div className="modal-content">
						<DonationDashboard event={event} />
						<button id="close-modal" onClick={closeDonationModal}>Close</button>
					</div>
					</div>
				)}
			</div>
	);
}

export default NonProfitEventPage;
