import './DiscoveryPage.css';
import {useAuth0} from '@auth0/auth0-react';
import LoginButton from '../LoginButton/LoginButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import AdminButton from './AdminButton/AdminButton';
import {useEffect, useState} from 'react';
import NonProfitHome from '../NonProfitHome/NonProfitHome';
import Organizations from '../Organizations/Organizations';
import EventListingPage from '../EventListingPage/EventListingPage';
import EventDetailsPage from '../EventDetailsPage/EventDetailsPage';
import { User } from 'lucide-react';
import DonationPage from '../Donate/DonationPage/DonationPage';
import DonateSuccess from '../Donate/DonateSuccess/DonateSuccess';

import {BrowserRouter as Router, Route, Switch, Link, useParams} from 'react-router-dom';

function DiscoveryPage() {
	const {user, isAuthenticated, isLoading} = useAuth0();
	const [isOrgAdmin, setIsOrgAdmin] = useState(false);
	const [adminOrg, setAdminOrg] = useState(0);
	const [isUserChecked, setIsUserChecked] = useState(false);
	const [closeAdminButton, setCloseAdminButton] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To control dropdown visibility

	useEffect(() => {
		if (isAuthenticated && !isLoading && user) {
			checkUser(user);
		}
	}, [isAuthenticated, isLoading, user, closeAdminButton]);

	const checkUser = async (user) => {
		try {
			await addUserToDatabase(user);
			const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/user/${user.name}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch user data: ${response.status}`);
			}
			const userData = await response.json();
			setIsOrgAdmin(userData.isOrgAdmin);
			if (userData.isOrgAdmin) {
				setAdminOrg(userData.organizationId);
			}
		} catch (error) {
			console.error('Error fetching user status:', error);
		} finally {
			setIsUserChecked(true);
		}
	};

	const addUserToDatabase = async (user) => {
		try {
			await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/user`, {
				method: 'POST', headers: {
					'Content-Type': 'application/json',
				}, body: JSON.stringify({id: user.name}),
			});
		} catch (error) {
			console.error('Error:', error);
		}
	};

	const myOrgClick = () => {
		window.location.href = "/";
	};

	return (
		<Router>
			<div className="page-container">
				<div className="account-dropdown">
					<button
						className="account-btn"
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					>
						<User className="icon" size={20} />
					</button>
					{isDropdownOpen && (<div className="dropdown-content">
						{isAuthenticated ? (<>
							<p>{user.name}</p>
						{isAuthenticated && !isOrgAdmin && isUserChecked && (
							<AdminButton style = {{backgroundColor: "#007bff"}} setCloseAdminButton={setCloseAdminButton} closeAdminButton={closeAdminButton}/>)}
							{isOrgAdmin && (
								<button style = {{backgroundColor: "#007bff"}} onClick={myOrgClick}>My Org</button>
							)}
						</>) : (<LoginButton style = {{backgroundColor: "#007bff"}}/>)}
						<LogoutButton/>
					</div>)}
				</div>

				<Switch>
					<Route exact path="/">
						<main>
							{isOrgAdmin ? (<NonProfitHome orgId={adminOrg}/>) : (<Organizations/>)}
						</main>
					</Route>
					<Route path="/organizations/:orgId/events">
						<EventListingWrapper/>
					</Route>
          <Route path="/client/events/:eventId" component={EventDetailsPage} />
          <Route path="/donate/:eventId" component={DonationPage} />
          <Route path="/success" component={DonateSuccess} />
				</Switch>
			</div>
		</Router>
	)
}

function EventListingWrapper() {
	const {orgId} = useParams();
	return <EventListingPage orgId={orgId}/>;
}

export default DiscoveryPage;