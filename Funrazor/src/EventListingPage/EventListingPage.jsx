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
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

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

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (!start || eventDate >= start) && (!end || eventDate <= end);
  });

  const totalPages = Math.ceil(filteredEvents.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const selectedEvents = filteredEvents.slice(startIndex, startIndex + postsPerPage);


  return (
    <div>
      <div id="event-header">
        <h1>{organization ? organization.name : 'Organization'} Events</h1>
      </div>
      <div id="header-buttons">
        <div className="back-button-container">
          <button
            onClick={() => history.push('/')} // Using history.push for navigation
            className="back-button"
          >
            Back to Organizations
          </button>
        </div>
        <div className="date-filter">
            <label>Search from:</label> <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="date-filter">
            <label>Search up to:</label> <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        {selectedEvents.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          <div id="event-list" className="space-y-6">
            {selectedEvents.map((event) => (
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
      {totalPages > 1 && (
          <div id="pagination-controls">
              <button id="pagination-buttons" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
              <span> Page {currentPage} of {totalPages} </span>
              <button id="pagination-buttons" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
      )}
    </div>
  );
};

export default EventListingPage;
