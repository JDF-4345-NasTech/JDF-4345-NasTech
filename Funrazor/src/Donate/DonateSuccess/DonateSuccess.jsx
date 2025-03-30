import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'
import './DonateSuccess.css';

const DonateSuccess = () => {
    const {user, isAuthenticated, isLoading} = useAuth0();
	const [event, setEvent] = useState(null);
    const history = useHistory();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const amount = searchParams.get('amount');

    const userEmail = user?.name;
    const tipIncluded = searchParams.get('tipIncluded') === 'true';
    const eventId = searchParams.get('eventId');

	useEffect(() => {
		if (eventId) {
            const eventIdInt = parseInt(eventId, 10);
			fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/events/${eventIdInt}`)
				.then((res) => res.json())
				.then((data) => {
					setEvent(data);
				}).then(console.log(event))
				.catch((err) => console.error('Error fetching event:', err));
		}
	}, [eventId]);

    const createDonation = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/donation/success`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventId: eventId,
              amount: amount,
              userEmail: userEmail, // Send only the email to the backend
              tipIncluded: tipIncluded,
            }),
          });
    
          if (response.ok) {
            console.log('Donation created successfully!');
          } else {
            console.error('Error creating donation');
          }
        } catch (error) {
          console.error('Error creating donation:', error);
        }
      };
    
      useEffect(() => {
        if (amount && eventId && userEmail) {
          createDonation(); // Create donation after payment success
        }
      }, [userEmail]);

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
