import './NonProfitHome.css'
import CreateEvent from '../CreateEvent/CreateEvent'
import EventListItem from "../EventListItem/EventListItem.jsx";
import { BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';

function NonProfitHome() {
    //Populate from backend
    const dummyEventData = [
        {
            eventImage: '',
            eventName: 'Awesome Event',
            rsvps: 150,
            eventDate: '2025-12-01',
            eventDetails: 'Join us for awesome event!',
            eventDonationProgress: 75,
        },
        {
            eventImage: '',
            eventName: 'Super Cool Event',
            rsvps: 300,
            eventDate: '2025-11-20',
            eventDetails: 'Come check out how super cool this event is!',
            eventDonationProgress: 50,
        },
    ];
  return (
    <Router>
        <Switch>
            <Route exact path='/'>
                <p>
                    <div id="non-profit-header">
                        <p id="non-profit-name">Best Non-Profit</p>
                        <p id="non-profit-details">This non-profit is the best one</p>
                        <img src="" alt="NonProfitImage" id="non-profit-image"/>
                    </div>
                    <div id="create-event-button">
                        <Link to='/create-event'>
                            <button>Create event</button>
                        </Link>
                    </div>
                    <div id="event-list">
                        {dummyEventData.map((event, index) => (
                          <EventListItem
                            key={index}
                            eventImage={event.eventImage}
                            eventName={event.eventName}
                            rsvps={event.rsvps}
                            eventDate={event.eventDate}
                            eventDetails={event.eventDetails}
                            eventDonationProgress={event.eventDonationProgress}
                          />
                        ))}
                    </div>
                </p>
            </Route>
            <Route path='/create-event'>
                <CreateEvent></CreateEvent>
            </Route>
        </Switch>
    </Router>
  )
}

export default NonProfitHome