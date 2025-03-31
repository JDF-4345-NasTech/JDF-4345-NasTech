import './EventListItem.css';

// eslint-disable-next-line react/prop-types
function EventListItem({ eventImage = "", eventName = "", rsvps = "", eventDate = "", eventDetails = "", eventDonationProgress }) {
    return (
        <div id="event-card-list-item">
            {/* <img src={eventImage} alt={eventName} id="event-image" /> */}
            <div id="event-card-details">
                <h2 id="event-card-title">{eventName}</h2>
                <p id="event-card-date">Date: {eventDate}</p>
                <p id="event-card-rsvps">RSVPs: {rsvps}</p>
                <div id="event-card-progress-container">
                    <span id="event-card-progress-text">Donations:</span>
                    <progress value={eventDonationProgress} max="100" id="event-card-item-progress-bar"></progress>
                </div>
                <p id="event-card-details-text">{eventDetails}</p>
            </div>
        </div>
    );
}

export default EventListItem;
