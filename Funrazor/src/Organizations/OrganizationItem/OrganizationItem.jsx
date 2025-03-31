import './OrganizationItem.css'
import {Link} from 'react-router-dom';

function OrganizationItem( {orgId, name, description} ) {

  return (
    <Link style={{textDecoration: 'none'}} to={`/organizations/${orgId}/events`} className="organization-link">
      <div className="organization-item">
        <h2 id='org-item-name'>{name}</h2>
        <p id='org-item-descrption'>{description}</p>
      </div>
    </Link>
  );
}

export default OrganizationItem