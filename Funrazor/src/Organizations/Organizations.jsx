import './Organizations.css'
import OrganizationItem from './OrganizationItem/OrganizationItem'
import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

function Organizations() {
    const { user, isAuthenticated } = useAuth0();
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrganizations();
        }
    }, [isAuthenticated]);

    /*
    Fetches all organizations using GET
    */
    const fetchOrganizations = () => {
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            setOrganizations(data);
        })
        .catch(error => {
            console.error('Error fetching organization', error);
        });
    }

    return (
        <div className="organizations-container">
            {organizations.map((org) => (
                <OrganizationItem orgId={org.id} name={org.name} description={org.description} />
            ))}
        </div>
    )
  }
  
  export default Organizations