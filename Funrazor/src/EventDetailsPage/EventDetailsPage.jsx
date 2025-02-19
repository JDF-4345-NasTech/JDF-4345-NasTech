import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import './EventDetailsPage.css';
import ClientRSVP from "../ClientRSVP/ClientRSVP.jsx";

const EventDetailsPage = ({event}) => {
	const eventId = useParams().eventId;
	const [isRsvpOpen, setIsRsvpOpen] = useState(false);
	const [rsvpCount, setRsvpCount] = useState({confirmed: 0, maybe: 0, no: 0});

	useEffect(() => {

		fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvps/${eventId}`)
			.then((res) => res.json())
			.then((data) => {
				setRsvpCount({
					confirmed: data.statusSummary?.Confirmed || 0,
					maybe: data.statusSummary?.Maybe || 0,
					no: data.statusSummary?.No || 0,
				});
			})
			.catch((err) => console.error("Error fetching RSVP data:", err));
	}, [eventId]);

	if (!event) return <p>Loading event details...</p>;

	return (
		<div className="max-w-3xl mx-auto p-6">
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
					<div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
					<div><strong>RSVPs:</strong> {event.rsvps || 0}</div>
					<div>{event.description}</div>
				</div>
				<div id="rsvp-button-container">
					<button onClick={() => setIsRsvpOpen(true)} className="bg-blue-500 text-white p-2 rounded-lg mt-2">
						RSVP Now
					</button>
					<p>✅ Confirmed: {rsvpCount.confirmed}</p>
					<p>🤔 Maybe: {rsvpCount.maybe}</p>
					<p>❌ No: {rsvpCount.no}</p>
				</div>
			</div>
			{isRsvpOpen && (<div className="modal-overlay">
				<div className="modal-content">
					<ClientRSVP event={event} setIsRsvpOpen={setIsRsvpOpen}/>
				</div>
			</div>)}
		</div>);
};

export default EventDetailsPage;