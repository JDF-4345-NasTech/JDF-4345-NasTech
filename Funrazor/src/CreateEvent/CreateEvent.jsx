import './CreateEvent.css'
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function CreateEvent( {updateEvents, orgId} ) {
    const history = useHistory();
    const [states, setStates] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [cities, setCities] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredStates, setFilteredStates] = useState([]);
    const [isStateSelected, setIsStateSelected] = useState(false);
    const [searchCity, setSearchCity] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const [isCitySelected, setIsCitySelected] = useState(false);

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        if (search && !isStateSelected) {
            const results = states.filter(state =>
                state.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredStates(results);
        } else {
            setFilteredStates([]);
        }
    }, [search, states, isStateSelected]);

    useEffect(() => {
        document.title = 'New Event';
      }, []);

    useEffect(() => {
        if (searchCity && !isCitySelected) {
            const results = cities.filter(city =>
                city.name.toLowerCase().includes(searchCity.toLowerCase())
            );
            setFilteredCities(results);
        } else {
            setFilteredCities([]);
        }
    }, [searchCity, cities, isCitySelected]);

    const fetchStates = () => {
        fetch(`https://api.countrystatecity.in/v1/countries/US/states`, {
            headers: {
                'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
            }
        })
            .then(response => response.json())
            .then(response => setStates(response))
            .catch(err => console.error(err));
    }

    const fetchCities = (stateISO2) => {
        fetch(`https://api.countrystatecity.in/v1/countries/US/states/${stateISO2}/cities`, {
            headers: {
                'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
            }
        })
            .then(response => response.json())
            .then(response => setCities(response))
            .catch(err => console.error(err));
    }

    /*
    Creates a new event with form input using POST
    */
    const createEvent = (formInput) => {
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/events`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: `${formInput.target.elements.eventNameInput.value}`,
	                  date: `${formInput.target.elements.dateInput.value}`,
	                  location: `${formInput.target.elements.cityInput.value}, ${formInput.target.elements.stateInput.value}`,
                    description: `${formInput.target.elements.eventDescriptionInput.value}`,
                    organizationId: orgId
                })
            }
        )
        .then(response => {
             if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
             } else {
                 emailSubscribers()
                return response.json();
              }
        })
        .catch(error => {});
    }

    const emailSubscribers = async () => {
        try {
            const res2 = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/subscribers`);
            if (!response.ok) {
                throw new Error(`Failed to fetch subscribers: ${response.status}`);
            }
            const data = await res2.json();
            console.log('Fetched Subscribers:', data);

            data.forEach(subscriber => {
                sendEmail(subscriber.email);
            });
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        }
    };

    const sendEmail = async(subscriber) => {
        const res3 = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/eventNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: `${subscriber}`,
                eventName: `${formInput.target.elements.eventNameInput.value}`,
                eventDate: `${formInput.target.elements.dateInput.value}`,
                eventDescription: `${formInput.target.elements.eventDescriptionInput.value}`,
                orgName: `${orgId.name}`,
            })
        });
    }

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setIsStateSelected(false);
    };

    const handleSelectState = (state) => {
        setSearch(state.name);
        setFilteredStates([]);
        setIsStateSelected(true);
        fetchCities(state.iso2);
    }

    const handleSearchCityChange = (event) => {
        setSearchCity(event.target.value);
        setIsCitySelected(false);
    };

    const handleSelectCity = (city) => {
        setSearchCity(city.name);
        setIsCitySelected(true);
        setFilteredCities([]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        createEvent(event);
        updateEvents();
        history.push('/');
    };

  return (
    <>
        <h3>New Event</h3>
        <form onSubmit={handleSubmit}>
            <div id="eventName">
                <label>Event Name</label>
                <input type="text" id="eventNameInput" name="eventNameInput" required></input>
            </div>
            <div id="date">
                <label>Date</label>
                <input type="date" id="dateInput" name="dateInput" required></input>
            </div>
            <div id="time">
                <label>Time</label>
                <input type="time" id="timeInput" name="timeInput" required></input>
            </div>
            <div id="state">
                <label>State</label>
                <input
                  type="text"
                  id="stateInput"
                  name="stateInput"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Start typing to search..."
                  required
                />
                <ul className="suggestions">
                    {filteredStates && filteredStates.map((state) => (
                      <li
                        key={state.iso2}
                        onClick={() => handleSelectState(state)}
                      >
                          {state.name}
                      </li>
                    ))}
                </ul>
            </div>
            <div id="city">
                <label>City</label>
                <input
                  type="text"
                  id="cityInput"
                  name="cityInput"
                  value={searchCity}
                  onChange={handleSearchCityChange}
                  placeholder="Start typing to search city..."
                  disabled={!isStateSelected}  // Disable city input until state is selected
                  required
                />
                <ul className="suggestions">
                    {filteredCities && filteredCities.map((city) => (
                      <li
                        key={city.id}
                        onClick={() => handleSelectCity(city)}
                      >
                          {city.name}
                      </li>
                    ))}
                </ul>
            </div>
            <div id="eventDescription">
                <label>Description</label>
                <input type="text" id="eventDescriptionInput" name="eventDescriptionInput" required></input>
            </div>
            <button  style = {{backgroundColor: "#007bff"}} type="submit">Create</button>
            <button onClick={() => history.push('/')}>Cancel</button>
        </form>
    </>
  )
}

export default CreateEvent