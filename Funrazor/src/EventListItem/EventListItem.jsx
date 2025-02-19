import './EventListItem.css';

// eslint-disable-next-line react/prop-types
function EventListItem({ eventImage = "", eventName = "", rsvps = "", eventDate = "", eventDetails = "", eventDonationProgress = "" }) {
    return (
        <div id="event-list-item">
            {/* <img src={eventImage} alt={eventName} id="event-image" /> */}
            <div id="event-details">
                <h2 id="event-title">{eventName}</h2>
                <p id="event-date">Date: {eventDate}</p>
                <p id="event-rsvps">RSVPs: {rsvps}</p>
                <div id="event-progress-container">
                    <span id="event-progress-text">Donations:</span>
                    <progress value={eventDonationProgress} max="100" id="event-progress-bar"></progress>
                </div>
                <p id="event-details-text">{eventDetails}</p>
            </div>
        </div>
    );
}

export default EventListItem;
