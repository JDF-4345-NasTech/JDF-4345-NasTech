import './OrganizationItem.css'

function OrganizationItem( {orgId, name, description} ) {

    return (
      <>
        <div className="organization-item">
            <h2>{name}</h2>
            <p>{description}</p>
        </div>
      </>
    )
  }
  
  export default OrganizationItem