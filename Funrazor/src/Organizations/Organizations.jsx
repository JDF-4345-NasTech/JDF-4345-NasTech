import './Organizations.css'
import OrganizationItem from './OrganizationItem/OrganizationItem'
import {useState, useEffect} from 'react'
import {useAuth0} from '@auth0/auth0-react'

function Organizations() {
	const {user, isAuthenticated} = useAuth0();
	const [organizations, setOrganizations] = useState([]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchOrganizations();
		}
	}, [isAuthenticated]);

	const fetchOrganizations = () => {
		fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations`)
			.then(response => response.json())
			.then(data => setOrganizations(data))
			.catch(error => console.error('Error fetching organization', error));
	}

	return (
		<div id='organizations'>
			<div id='title'>
				<h1>FUNRAZOR</h1>
			</div>
			<h2 id='header'>Organizations to Support</h2>
			<div className="organizations-container">
				{organizations.map((org) => (
					<OrganizationItem
						key={org.id}
						orgId={org.id}
						name={org.name}
						description={org.description}
					/>
				))}
			</div>
		</div>
	);
}

export default Organizations;
