import './EventListingPage.css';
import { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom'; // Import useHistory
import {useAuth0} from "@auth0/auth0-react";
import EventListItem from '../EventListItem/EventListItem';
import EventDetailsPage from '../EventDetailsPage/EventDetailsPage';

const EventListingPage = () => {
	const {user, isAuthenticated} = useAuth0();
  const { orgId } = useParams();
  const history = useHistory(); // Initialize useHistory
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  const [subscribe, setSubscribe] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

  useEffect(() => {
    // Fetch organization details
    fetch(`${import.meta. env.VITE_BACKEND_ADDRESS}/organizations/${orgId}`)
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

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const isSubscribed = await checkSubscription(); 
      setSubscribe(isSubscribed);
    };
  
    fetchSubscriptionStatus();
  }, [user]);

  const checkSubscription = async () => {
      if (!isAuthenticated) {
        return false;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/subscribers`);
        if (!res.ok) {
          return false;
        };
    
        const subscribers = await res.json();
        return subscribers.some(subscriber => subscriber.userId === user.id); // Returns true if user is in the list
      } catch (error) {
        console.error("Error checking subscription:", error);
        return false;
      }
    };

  const handleSubscription = async () => {
		if (!isAuthenticated) {
			alert("Please log in to subscribe to organizations.");
			return;
		}

    setSubscribe(!subscribe);
    let res;
    try {
      if (!subscribe) {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.name }),
        });
      }
      else {
        res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.name }),
        });
      }

			if (!res.ok) {
				throw new Error(`Failed to subscribe: ${res.status}`);
			}
		} catch (err) {
			console.error("Error subscribing user:", err);
		}
	};
  
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
      <div id="non-profit-header">
        <div id="non-profit-name">{organization ? organization.name : 'Organization'} Events</div>
        <p id="non-profit-details">{organization.description}</p>
          {/* <img src={organization.image || ''} alt="NonProfitImage" id="non-profit-image" /> */}
      </div>
      <div id="header-buttons">
        <div id="back-subscribe">
          <div className="back-button-container">
            <button
              onClick={() => history.push('/')} // Using history.push for navigation
              className="bg-blue-500 text-white p-2 rounded-lg mt-2"
            >
              Back to Organizations
            </button>
          </div>
          <div className="subscribe-button-container">
            <button
              onClick={handleSubscription} // Using history.push for navigation
              className="bg-blue-500 text-white p-2 rounded-lg mt-2"
            >
              {subscribe ? "Unsubscribe" : 'Subscribe'}
            </button>
          </div>
        </div>
        <div className="date-filters">
          <div className="date-filter">
            <label>Search from:</label> <input type="date" value={startDate}
                                               onChange={(e) => setStartDate(e.target.value)}/>
          </div>
          <div className="date-filter">
            <label>Search up to:</label> <input type="date" value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}/>
          </div>
        </div>
      </div>
      <div>
        {selectedEvents.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          <div id="event-list-grid">
            {selectedEvents.map((event) => {
              if (!event) return null;
              return (
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
                    eventDonationProgress={event.donationGoal > 0 ? (event.donationTotal / event.donationGoal) * 100 : 0}
                    eventDetails={event.description}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <div>
        {totalPages > 1 && (
          <div id="pagination-controls">
            <button id="pagination-buttons" disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}>Previous
            </button>
            <span> Page {currentPage} of {totalPages} </span>
            <button id="pagination-buttons" disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}>Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListingPage;
