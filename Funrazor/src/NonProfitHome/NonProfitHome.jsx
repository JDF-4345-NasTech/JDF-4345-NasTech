import './NonProfitHome.css';
import CreateEvent from '../CreateEvent/CreateEvent';
import EventListItem from "../EventListItem/EventListItem.jsx";

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FaPencilAlt } from 'react-icons/fa';
import NonProfitEventPage from "../NonProfitEventPage/NonProfitEventPage.jsx";

function NonProfitHome({ orgId }) {
    const { user, isAuthenticated } = useAuth0();
    const [events, setEvents] = useState([]);
    const [created, setCreated] = useState(false);
    const [organization, setOrganization] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [requests, setRequests] = useState([]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToAccept, setUserToAccept] = useState(null);  // Store the user ID for whom confirmation is needed


    useEffect(() => {
        if (isAuthenticated) {
            fetchEvents();
            fetchOrganization();
        }
    }, [isAuthenticated, orgId, created, showRequestsModal]);

    const fetchOrganization = () => {
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}`)
          .then(response => response.json())
          .then(data => {
              setOrganization(data);
              setNewDescription(data.description);
              console.log("Fetched Organization Data:", data); // Log the data here
          })
          .catch(error => console.error('Error fetching organization', error));
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/orgdesc/${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newDescription }),
            });

            if (response.ok) {
                setOrganization({ ...organization, description: newDescription });
                setIsEditing(false);
            } else {
                console.error('Failed to update description');
            }
        } catch (error) {
            console.error('Error updating description', error);
        }
    };

    const fetchEvents = () => {
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/events`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {setEvents(data)
                console.log(data)})
            .catch(error => console.error('Error fetching events', error));
    };

    const updateEvents = () => setCreated(!created);

    useEffect(() => {
        document.title = organization.name;
    }, []);
    
    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return (!start || eventDate >= start) && (!end || eventDate <= end);
    });

    const totalPages = Math.ceil(filteredEvents.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const selectedEvents = filteredEvents.slice(startIndex, startIndex + postsPerPage);

    const openRequestsModal = () => {
        fetchRequests();
        setShowRequestsModal(true);
    };

    const closeRequestsModal = () => {
        setShowRequestsModal(false);
    };

    const fetchRequests = () => {
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/${orgId}/requests`)
            .then(response => response.json())
            .then(data => { setRequests(data)
            console.log(data) })
            .catch(error => console.error('Error fetching requests:', error));
    };

    const handleAccept = (userId) => {
        setUserToAccept(userId);  // Store the user ID for confirmation
        setShowConfirmModal(true);
      };

      const handleConfirmAccept = () => {
        if (!userToAccept) return;
      
        const requestBody = {
          userId: userToAccept, 
          isOrgAdmin: true, 
          organizationId: orgId, 
        };
      
        // Send the PATCH request to update user admin status
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/userAdmin`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
          .then(response => response.json())
          .then(data => {
            console.log('User updated:', data);

            fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/remove-request`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userToAccept, 
              }),
            })
              .then(response => response.json())
              .then(() => {
                // Handle success for request removal
                console.log('Request removed from the organization');
                setRequests(prev => prev.filter(req => req.id !== userToAccept));
              })
              .catch(error => {
                console.error('Error removing request:', error);
                alert('Error removing request');
              });
          })
          .catch(error => {
            console.error('Error accepting user:', error);
            alert('Error accepting user');
          });
      
        // Close the confirmation modal
        setShowConfirmModal(false);
      };

      const handleCancelAccept = () => {
        setShowConfirmModal(false);  // Close the confirmation modal
      };
      
      const handleDeny = (userId) => {
        // Send a PATCH request to remove the request from the organization
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/remove-request`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId, 
          }),
        })
          .then(response => response.json())
          .then(() => {
            console.log('Request denied and removed from the organization');
            setRequests(prev => prev.filter(req => req.id !== userId));
          })
          .catch(error => {
            console.error('Error denying request:', error);
            alert('Error denying request');
          });
      };
      

    return (
        isAuthenticated && (
            <Router>
                <Switch>
                    <Route exact path='/'>
                        <div id="non-profit-header">
                            <p id="non-profit-name">{organization.name}</p>
                            <div id="non-profit-details">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                        />
                                        <button onClick={handleSave}>Save</button>
                                    </>
                                ) : (
                                    <>
                                        <p>{organization.description}</p>
                                        <button onClick={handleEditClick}>
                                            <FaPencilAlt />
                                        </button>
                                    </>
                                )}
                                {/* Requests Button */}
                                {organization.requests && organization.requests.length > 0 && (
                                    <button id="requests-button" onClick={openRequestsModal}>
                                        Requests ({organization.requests.length})
                                    </button>
                                )}
                            </div>
                            {/* <img src={organization.image || ''} alt="NonProfitImage" id="non-profit-image" /> */}
                        </div>
                        {showRequestsModal && (
                            <div className="modal">
                                <div className="modal-content">
                                    <span className="close-button" onClick={closeRequestsModal}>×</span>
                                    <h2>Requests</h2>
                                    {requests.length === 0 ? (
                                        <p>No requests at the moment.</p>
                                    ) : (
                                        <ul>
                                            {requests.map((request) => (
                                                <li key={request.id}>
                                                    <p>{request.id}</p>
                                                    <button onClick={() => handleAccept(request.id)}>Accept</button>
                                                    <button onClick={() => handleDeny(request.id)}>Deny</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Confirmation Modal */}
                        {showConfirmModal && (
                            <div className="modal">
                            <div className="modal-content">
                                <span className="close-button" onClick={handleCancelAccept}>×</span>
                                <h2>Are you sure you want to make this user an admin?</h2>
                                <p>This action will grant them admin privileges for the organization.</p>
                                <button onClick={handleConfirmAccept}>Yes, accept</button>
                                <button onClick={handleCancelAccept}>Cancel</button>
                            </div>
                            </div>
                        )}
                        <div id="event-buttons">
                            <div id="create-event-button">
                                <Link to='/create-event' style={{ textDecoration: "none" }}>
                                    <button>+ Create Event</button>
                                </Link>
                            </div>
                            <div className="date-filters">
                                <div className="date-filter">
                                    <label>Search from:</label> <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="date-filter">
                                    <label>Search up to:</label> <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div id="npe-event-list">
                            {selectedEvents.map((event, index) => (
                                <Link to={`/events/${event.id}`} key={index} style={{ textDecoration: 'none' }}>
                                    <EventListItem
                                        eventImage={event.eventImage || ''}
                                        eventName={event.name}
                                        rsvps={event.rsvpResponses.length || 0}
                                        eventDate={event.date}
                                        eventDetails={event.description}
                                        eventDonationProgress={event.donationGoal > 0 ? (event.donationTotal / event.donationGoal) * 100 : 0}
                                    />
                                </Link>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div id="pagination-controls">
                                <button id="pagination-buttons" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                                <span> Page {currentPage} of {totalPages} </span>
                                <button id="pagination-buttons" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                            </div>
                        )}
                    </Route>
                    <Route path='/create-event'>
                        <CreateEvent updateEvents={updateEvents} orgId={orgId} orgName={organization.name} />
                    </Route>
                    <Route
                        path='/events/:eventId'
                        render={({ match }) => {
                            const { eventId } = match.params;
                            const selectedEvent = events.find(event => String(event.id) === eventId);
                            return <NonProfitEventPage event={selectedEvent} />;
                        }}
                    />
                </Switch>
            </Router>
        )
    );
}

export default NonProfitHome;

