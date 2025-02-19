import './EventListingPage.css';
import { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom'; // Import useHistory
import EventListItem from '../EventListItem/EventListItem';
import EventDetailsPage from '../EventDetailsPage/EventDetailsPage';

const EventListingPage = () => {
  const { orgId } = useParams();
  const history = useHistory(); // Initialize useHistory
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    // Fetch organization details
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrganization(data);
      })
      .catch((err) => {
        console.error("Error fetching organization details:", err);
      });

    // Fetch events
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, [orgId]);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <div id="event-header">
        <h1>{organization ? organization.name : 'Organization'} Events</h1>
      </div>
	  <div className="back-button-container">
        <button
          onClick={() => history.push('/')} // Using history.push for navigation
          className="back-button"
        >
          Back to Organizations
        </button>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        {events.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          <div id="event-list" className="space-y-6">
            {events.map((event) => (
              <Link
				to={`/client/events/${event.id}`}
				key={event.id}
				style={{ textDecoration: 'none' }}
			>
			  <EventListItem
				eventImage={event.eventImage || ''}
				eventName={event.name}
				eventDate={new Date(event.date).toLocaleDateString()}
				rsvps={event.rsvpResponses ? event.rsvpResponses.length : 0}
				eventDonationProgress={event.donationProgress || 0}
				eventDetails={event.description}
			  />
			</Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListingPage;
