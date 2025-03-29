import './DonationPage.css'
import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { loadStripe } from '@stripe/stripe-js';
import { useParams } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function DonationPage() {
	const {user, isAuthenticated} = useAuth0();
    const [amount, setAmount] = useState('');
	const [coverFees, setCoverFees] = useState(false);
	const { eventId } = useParams();

	const serviceFeeRate = 0.05; // 5% service fee
	const totalAmount = coverFees ? (amount * (1 + serviceFeeRate)).toFixed(2) : amount;

	const handleCheckout = async () => {
		const stripe = await stripePromise;
		const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/create-checkout-session`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount: totalAmount, eventId: eventId }),
		});

		const session = await response.json();
		await stripe.redirectToCheckout({ sessionId: session.id });
	};

	return (
		<div className="donation-container">
			<h2>Make a Donation</h2>
			{isAuthenticated && <p>Logged in as {user.name}</p>}
			<div className="donation-form">
				<label>
					Donation Amount ($)
					<input 
						type="number" 
						value={amount} 
						onChange={(e) => setAmount(e.target.value)} 
						min="1" 
						required 
					/>
				</label>
				<div className="cover-fee">
					<input 
						type="checkbox" 
						checked={coverFees} 
						onChange={() => setCoverFees(!coverFees)} 
					/>
					<label>Cover the service fee (+5%)</label>
				</div>
				<button onClick={handleCheckout}>Donate ${totalAmount}</button>
			</div>
		</div>
	);
}

export default DonationPage;