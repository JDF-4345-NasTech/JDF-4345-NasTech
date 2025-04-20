import './NonProfitEventPage.css'
import {useState} from 'react';
import RSVPDashboard from "../RSVPDashboard/RSVPDashboard.jsx";
import DonationDashboard from '../Donate/DonationDashboard/DonationDashboard';
import {useAuth0} from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom';
import CreateDonorLetter from '../CreateDonorLetter/CreateDonorLetter';

function NonProfitEventPage({event}) {
	const {user, isAuthenticated} = useAuth0();
	const history = useHistory();
	const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
	const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
	const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);

	function closeRSVPModal() {
		setIsRSVPModalOpen(false);
	}

	function closeDonationModal() {
		setIsDonationModalOpen(false);
	}

	const sendDonorsClick = () => {
		setIsDonationModalOpen(false);
		setIsDonorModalOpen(true);
	};

	return (
		<div className="non-profit-event-page">
			<div id="npe-event-header">
				<div id="npe-title-container">
					<div id="npe-event-name">{event.name}</div>
				</div>
				<div id="npe-event-details-progress-container">
					<span
						id="npe-event-details-progress-text">Donations: ${event.donationTotal?.toFixed(2)} / ${event.donationGoal?.toFixed(2)}</span>
					<progress
						value={event.donationGoal > 0 ? (event.donationTotal / event.donationGoal) * 100 : 0}
						max="100"
						id="npe-event-details-progress-bar"
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
			<div id="body-container">
				<div id="event-body">
					<div id="npe-details-about-card">About</div>
					<div id="npe-details-about-info">Date: {new Date(event.date).toLocaleDateString()}</div>
					<div id="npe-details-about-info">RSVPs: {event.rsvpResponses ? event.rsvpResponses.length : 0}</div>
					<div id="npe-details-about-info">{event.description}</div>
				</div>
				<div id="button-container">
					{/* RSVP Button */}
					<button
						style={{ backgroundColor: "#007bff" }}
						id="npe-rsvp-button"
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
						<button style={{ backgroundColor: '#8B0000' }} id="close-modal" onClick={closeRSVPModal}>Close</button>
					</div>
					</div>
				)}

				{/* Donation Modal */}
				{isDonationModalOpen && (
					<div className="modal-overlay">
						<div className="modal-content">
							<DonationDashboard event={event} />
							<div className="modal-buttons">
								<button 
									style={{ backgroundColor: '#8B0000' }} id="close-modal" 
									onClick={closeDonationModal}> Close 
								</button>
								<button
									style={{ backgroundColor: '#2E8B57'}} id="send-to-donors"
									onClick={(sendDonorsClick)}> Send to Donors
								</button>
							</div>
						</div>
					</div>
				)}

				{isDonorModalOpen && (
					<div className="modal-overlay">
						<div className="modal-content">
							<CreateDonorLetter event={event} onClose={() => setIsDonorModalOpen(false)} />
						</div>
					</div>
				)}
			</div>
	);
}

export default NonProfitEventPage;
