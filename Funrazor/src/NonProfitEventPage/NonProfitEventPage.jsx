import './NonProfitEventPage.css'
import {useState} from 'react';
import RsvpPopUp from "./RsvpPopUp/RsvpPopUp.jsx";
import { useAuth0 } from '@auth0/auth0-react'

function NonProfitEventPage( {event} ) {
	const { user, isAuthenticated } = useAuth0();
	const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

	function closeRsvp(){
		setIsModalOpen(false);
	}

	const onRSVP = async (response) => {
		const rsvpData = {
			email: user.name,
			response,
			eventId: event.id,
			eventName: event.name, 
			eventDate: event.date,
		};
	
		try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(rsvpData),
			});

			const res2 = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvpMail`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(rsvpData),
			});
	
			if (res.ok && res2.ok) {
				const result = await res.json();
				alert('RSVP submitted successfully!');
			} else {
				const error = await res.json();
				console.error(error.message);
				alert('Failed to submit RSVP. Please try again.');
			}
		} catch (err) {
			console.error(err);
			alert('An error occurred while submitting your RSVP.');
		}
	}

	return (
		<div className="non-profit-event-page">
			<div id="event-header">
				<h1 id="event-name">{event.name}</h1>
				<div id="event-progress-container">
					<span id="event-progress-text">Donations:</span>
					<progress value={event.donationProgress ?? 0} max="100" id="event-progress-bar"></progress>
				</div>
			</div>
			<h2 id="about-text"><strong>About Our Event</strong></h2>
			<div id="body-container">
				<div id="event-body">
					{/*<img src={event.eventImage || ''} alt={event.name} className="event-image"/>*/}
					<div><strong></strong>Date: {new Date(event.date).toLocaleDateString()}</div>
					<div><strong>RSVPs:</strong> {event.rsvps || 0}</div>
					<div>{event.description}</div>
				</div>
				<div id="rsvp-button-container">
					<button id="rsvp-button" onClick={() => setIsModalOpen(true)}>RSVP Information</button>
				</div>
			</div>

			<RsvpPopUp
				isOpen={isModalOpen}
				onClose={() => closeRsvp()}
				onRSVP={onRSVP}
			/>

		</div>
	);
}

export default NonProfitEventPage;
