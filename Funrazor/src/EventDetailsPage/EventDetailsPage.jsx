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
		<div className="max-w-3xl mx-auto p-6">
			<div id="event-details-page-header">
				<h1 id="event-details-page-name">{event.name}</h1>
				<div id="event-progress-container">
					<span id="event-progress-text">Donations: ${event.donationTotal?.toFixed(2)} / ${event.donationGoal?.toFixed(2)}</span>
					<progress 
						value={event.donationGoal > 0 ? (event.donationTotal / event.donationGoal) * 100 : 0} 
						max="100" 
						id="event-progress-bar"
					></progress>
				</div>
			</div>
	
			<div id="event-details-back-button-container">
				<button
					onClick={() => history.goBack()} // Go back to the previous page
					className="bg-gray-500 text-white p-2 rounded-lg mt-4"
				>
					Back to Events
				</button>
			</div>
	
			<div id="body-container">
				<div id="event-body">
					<div><strong>About</strong></div>
					<div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
					<div><strong>RSVPs:</strong> {rsvpCount.total}</div>
					<div>{event.description}</div>
				</div>
	
				<div id="rsvp-button-container">
					<div id="donate-button-container">
						<button onClick={() => history.push(`/donate/${eventId}`)}>Donate</button>
					</div>
					<button onClick={() => setIsRsvpOpen(true)} className="bg-blue-500 text-white p-2 rounded-lg mt-2">
						RSVP Now
					</button>
					<p>✅ Confirmed: {rsvpCount.confirmed}</p>
					<p>🤔 Maybe: {rsvpCount.maybe}</p>
					<p>❌ No: {rsvpCount.no}</p>
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