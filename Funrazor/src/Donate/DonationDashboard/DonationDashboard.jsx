import './DonationDashboard.css';
import {useState, useEffect} from 'react';

const DonationDashboard = ({event}) => {
	const [donations, setDonations] = useState([]);
	const [donationTotal, setDonationTotal] = useState(0);
	const [errorMessage, setErrorMessage] = useState([]);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/donations/${event.id}`)
			.then((res) => {
				if (!res.ok) {
					if (res.status === 404) {
						setErrorMessage("No donations found for this event.");
						return null;
					}
					throw new Error("Failed to fetch donations.");
				}
				return res.json();
			})
			.then((data) => {
                if(data){
					setDonations(data.donations);
					setErrorMessage("");
					setDonationTotal(event.donationTotal);
				}
			})
			.catch((err) => console.error('Error fetching donations:', err));
	}, [event]);

	if (errorMessage) {
		return <div>{errorMessage}</div>;
	}

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
						<td>{donation.tipIncluded 
                        ? (donation.amount / 1.05).toFixed(2)  // Display only 95% of the amount when tipIncluded is true
                        : donation.amount.toFixed(2)
                        }</td>
					</tr>
				))}
				</tbody>
			</table>
		</>
	);
};

export default DonationDashboard;
