import './OrganizationItem.css'
import {Link} from 'react-router-dom';

function OrganizationItem( {orgId, name, description} ) {

  return (
    <Link to={`/organizations/${orgId}/events`} className="organization-link">
      <div className="organization-item">
        <h2>{name}</h2>
        <p>{description}</p>
      </div>
    </Link>
  );
}

export default OrganizationItem