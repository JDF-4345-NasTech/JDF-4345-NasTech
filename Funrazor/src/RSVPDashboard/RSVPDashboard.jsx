import './RSVPDashboard.css';
import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';

const RSVPDashboard = ({eventId}) => {
	const [entry, setEntry] = useState(null);
	const [rsvps, setRsvps] = useState([]);
	const [statusSummary, setStatusSummary] = useState([0, 0, 0]);  // Default to an array with 3 elements
	const statusArray = ['Confirmed', 'Maybe', 'No'];

	useEffect(() => {
		document.title = 'Event RSVPs';
	}, []);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/events/${eventId}`)
			.then(response => response.json())
			.then(data => {
				setEntry(data);
			})
			.catch(error => {
				console.error('Error fetching event data', error);
			});
	}, [eventId]);

	useEffect(() => {
		const fetchRSVPs = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvps/${eventId}`);
				const data = await response.json();
				setRsvps(data.rsvps);
				setStatusSummary(data.statusSummary);
			} catch (error) {
				console.error('Error fetching RSVPs:', error);
			}
		};

		fetchRSVPs();
	}, [eventId]);

	if (!entry) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<h1>Event {eventId}: {entry.name}</h1>
			<h3>RSVPs</h3>
			<table id='rsvp_stats'>
				<thead>
				<tr>
					<th className="yCol">Confirmed</th>
					<th className="mCol">Maybe</th>
					<th className="nCol">No</th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td className="yCol">{statusSummary[0] !== undefined ? statusSummary[0] : 0}</td>
					<td className="mCol">{statusSummary[1] !== undefined ? statusSummary[1] : 0}</td>
					<td className="nCol">{statusSummary[2] !== undefined ? statusSummary[2] : 0}</td>
				</tr>
				</tbody>
			</table>
			<h3>RSVP List</h3>
			<table id='rsvp_list'>
				<thead>
				<tr id='rsvp_header'>
					<th id='name-header'>Name</th>
					<th id='email-header'>Email</th>
					<th id='status-header'>Status</th>
				</tr>
				</thead>
				<tbody>
				{rsvps.map((rsvp, index) => (
					<tr key={index} className="rsvp-row">
						<td>{rsvp.lname}, {rsvp.fname}</td>
						<td>{rsvp.email}</td>
						<td>{statusArray[rsvp.status]}</td>
					</tr>
				))}
				</tbody>
			</table>
		</>
	);
};

export default RSVPDashboard;
