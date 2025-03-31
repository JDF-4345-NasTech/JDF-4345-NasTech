import {useState} from 'react';
import {useAuth0} from "@auth0/auth0-react";
import SuccessPopup from "./SuccessPopup/SuccessPopup.jsx";
import "./ClientRSVP.css";

const ClientRSVP = ({event, setIsRsvpOpen}) => {
	const {user, isAuthenticated} = useAuth0();
	const [rsvpStatus, setRsvpStatus] = useState(null);
	const [subscribe, setSubscribe] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const handleRsvpSubmit = async () => {
		if (!isAuthenticated) {
			alert("Please log in to RSVP.");
			return;
		}

		if (!rsvpStatus) {
			setError("Please select an RSVP option.");
			return;
		}

		const rsvpData = {
			email: user.name,
			response: rsvpStatus,
			eventId: event.id,
			eventName: event.name,
			eventDate: event.date,
		};

		try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(rsvpData),
			});

			const res2 = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvpMail`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(rsvpData),});

			if (res.ok && res2.ok) {
				if (subscribe) {
					await subscribeToOrg();
				}
				setSuccess(true);
				setError('');
				alert("RSVP submitted successfully!");
			} else {
				const errorData = await res.json();
				setError(errorData.message || "Failed to submit RSVP. Please try again.");
			}
		} catch (err) {
			console.error(err);
			setError("An error occurred while submitting your RSVP.");
		}
	};

	const subscribeToOrg = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${event.organizationId}/subscribers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: user.name }),
			});

			if (!res.ok) {
				throw new Error(`Failed to subscribe: ${res.status}`);
			}
			console.log("User subscribed successfully!");
		} catch (err) {
			console.error("Error subscribing user:", err);
		}
	};

	// Close both RSVP modal and Success Popup
	const handleSuccessClose = () => {
		setSuccess(false);
		setIsRsvpOpen(false);
	};

	return (
		<div>
			<div className="modal-overlay">
				<div className="modal-content">
					<h2>RSVP</h2>
					{error && <p style={{ color: 'red' }}>{error}</p>}
					<div id='rsvp-buttons'>
						<button onClick={() => setRsvpStatus('Yes')}
										style={{fontWeight: rsvpStatus === 'Yes' ? 'bold' : 'normal'}}>Yes
						</button>
						<button onClick={() => setRsvpStatus('No')}
										style={{fontWeight: rsvpStatus === 'No' ? 'bold' : 'normal'}}>No
						</button>
						<button onClick={() => setRsvpStatus('Maybe')}
										style={{fontWeight: rsvpStatus === 'Maybe' ? 'bold' : 'normal'}}>Maybe
						</button>
					</div>
					<div>
						<label>
							<input
								type="checkbox"
								checked={subscribe}
								onChange={() => setSubscribe(!subscribe)}
							/> Subscribe be updated about this organization's events!
						</label>
					</div>
					<div id='rsvp-buttons'>
						<button onClick={handleRsvpSubmit}>Confirm</button>
						<button style={{ backgroundColor: '#8B0000' }} onClick={() => setIsRsvpOpen(false)}>Cancel</button>
					</div>
				</div>
			</div>
			{success && (
				<div className="success-popup-overlay">
					<div className="success-popup-content">
						<SuccessPopup onClose={handleSuccessClose}/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientRSVP;