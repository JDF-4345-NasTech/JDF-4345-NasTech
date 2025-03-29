import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './DonateSuccess.css';

const DonateSuccess = () => {
	const [event, setEvent] = useState(null);
    const history = useHistory();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get('eventId');

	useEffect(() => {
		if (eventId) {
			// Fetch the event details
            const eventIdInt = parseInt(eventId, 10);
			fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/events/${eventIdInt}`)
				.then((res) => res.json())
				.then((data) => {
					setEvent(data);
				}).then(console.log(event))
				.catch((err) => console.error('Error fetching event:', err));
		}
	}, [eventId]);

	return (
		<div className="success-container">
			<h2>Thank you for your donation!</h2>
			{event && (
				<>
					<p>Your generous donation will help support {event.name}.</p>
					<p>Event Date: {new Date(event.date).toLocaleDateString()}</p>
				</>
			)}
			<button
				className="back-to-event-btn"
				onClick={() => history.push(`/client/events/${eventId}`)} // Navigate back to the event page
			>
				Back to Event Page
			</button>
		</div>
	);
};

export default DonateSuccess;
