import {useState, useEffect} from "react";
import { useParams, useHistory } from "react-router-dom";
import './EventDetailsPage.css';
import ClientRSVP from "../ClientRSVP/ClientRSVP.jsx";

const EventDetailsPage = ({}) => {
	const eventId = useParams().eventId;
	const [event, setEvent] = useState([]);
	const history = useHistory();
	const [isRsvpOpen, setIsRsvpOpen] = useState(false);
	const [rsvpCount, setRsvpCount] = useState({confirmed: 0, maybe: 0, no: 0, total: 0});

	useEffect(() => {
		fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/events/${eventId}`)
			.then((res) => res.json())
			.then((data) => {
				setEvent(data);
				const rsvpResponses = data.rsvpResponses || []; // Ensure it's an array
	
				const counts = {
					confirmed: rsvpResponses.filter(rsvp => rsvp.response.toLowerCase() === "yes").length,
					maybe: rsvpResponses.filter(rsvp => rsvp.response.toLowerCase() === "maybe").length,
					no: rsvpResponses.filter(rsvp => rsvp.response.toLowerCase() === "no").length,
				};
	
				counts.total = counts.confirmed + counts.maybe + counts.no; // Add total count
	
				console.log(counts);
				setRsvpCount(counts);
			})
			.catch((err) => console.error("Error fetching RSVP data:", err));
	}, [eventId, isRsvpOpen]);

	if (!event) return <p>Loading event details...</p>;

	return (
		<div>
			<div id="event-details-page-header">
				<div id="event-details-page-name-container">
					<div id="event-details-page-name">{event.name}</div>
				</div>
				<div id="event-details-progress-container">
					<span id="event-details-progress-text">Donations: ${event.donationTotal?.toFixed(2)} / ${event.donationGoal?.toFixed(2)}</span>
					<progress
						value={event.donationGoal > 0 ? (event.donationTotal / event.donationGoal) * 100 : 0}
						max="100"
						id="event-details-progress-bar"
					></progress>
				</div>
			</div>

			<div id="event-details-back-button-container">
				<div id="event-column">
					<button
						onClick={() => history.goBack()} // Go back to the previous page
						className="bg-gray-500 text-white p-2 rounded-lg mt-4"
					>
						Back to Events
					</button>
					<div id="event-row"></div>
					<div id="body-container">
						<div id="event-body">
							<div id="event-details-about-card">About</div>
							<div id="event-details-about-info">Date: {new Date(event.date).toLocaleDateString()}</div>
							<div id="event-details-about-info">RSVPs: {rsvpCount.total}</div>
							<div id="event-details-about-info">{event.description}</div>
						</div>
						<div id="rsvp-button-container">
							<div id="donate-button-container">
								<button onClick={() => history.push(`/donate/${eventId}`)}>Donate</button>
							</div>
							<button id="rsvp-button" onClick={() => setIsRsvpOpen(true)}
											className="bg-blue-500 text-white p-2 rounded-lg mt-2">
								RSVP Now
							</button>
							<div id="donation-status-container">
								<div> Confirmed: {rsvpCount.confirmed}</div>
								<div> Maybe: {rsvpCount.maybe}</div>
								<div> No: {rsvpCount.no}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modal for RSVP */}
			{isRsvpOpen && (
				<div className="modal-overlay">
					<div className="modal-content">
						<ClientRSVP event={event} setIsRsvpOpen={setIsRsvpOpen}/>
					</div>
				</div>
			)}
		</div>
	);

};

export default EventDetailsPage;