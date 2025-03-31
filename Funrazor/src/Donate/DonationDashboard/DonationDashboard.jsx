import './DonationDashboard.css';
import {useState, useEffect} from 'react';

const DonationDashboard = ({event}) => {
	const [donations, setDonations] = useState([]);
	const [donationTotal, setDonationTotal] = useState(0);

	useEffect(() => {
		// Assuming an endpoint that fetches donations for the event
		fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/donations/${event.id}`)
			.then((res) => res.json())
			.then((data) => {
                console.log(data)
				setDonations(data.donations);
				setDonationTotal(event.donationTotal);
			})
			.catch((err) => console.error('Error fetching donations:', err));
	}, [event]);

	if (!donations) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<h1>Event: {event.name}</h1>
			<h3>Donation Details</h3>
			<div id="donation-stats">
				<p><strong>Donation Total: </strong>${donationTotal?.toFixed(2)}</p>
				<p><strong>Donation Goal: </strong>${event.donationGoal?.toFixed(2)}</p>
			</div>
			<table id='donation_list'>
				<thead>
				<tr id='donation-header'>
					<th id='email-header'>Email</th>
					<th id='amount-header'>Amount ($)</th>
				</tr>
				</thead>
				<tbody>
				{donations.map((donation, index) => (
					<tr key={index} className="donation-row">
						<td>{donation.donorName}</td>
						{donation.tipIncluded 
                        ? (donation.amount / 1.05).toFixed(2)  // Display only 95% of the amount when tipIncluded is true
                        : donation.amount.toFixed(2)
                        }
					</tr>
				))}
				</tbody>
			</table>
		</>
	);
};

export default DonationDashboard;
