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
			.then(data => {
				if (Array.isArray(data)) {
					setOrganizations(data);
				} else {
					console.error('Expected an array but got:', data);
					setOrganizations([]);  // Default to empty array
				}
			}).catch(error => console.error('Error fetching organization', error));
	}

	return (
		<div id='organizations'>
            { isAuthenticated &&
			(<>
            <h2 id='header'>Organizations</h2>
			<div className="organizations-container">
				{organizations.map((org) => (
					<OrganizationItem
						key={org.id}
						orgId={org.id}
						name={org.name}
						description={org.description}
					/>
				))}
			</div> </>)}
            {!isAuthenticated && (
                <div id='landing-page' className="landing-page">
              
                <section className="landing-content">
                  <h1 className="landing-title">Welcome to Funrazor</h1>
                  <p className="landing-description">
                    A central platform that helps non-profit organizations manage their fundraising efforts with ease.
                  </p>
              
                  <p className="landing-info">
                    Join a community of passionate individuals and organizations dedicated to making a difference. Create or explore fundraising campaigns and help drive change.
                  </p>
                </section>
              
                <footer className="landing-footer">
                  <p>© 2025 Funrazor | All Rights Reserved</p>
                </footer>
              </div>
              
            )}
		</div>
	);
}

export default Organizations;
