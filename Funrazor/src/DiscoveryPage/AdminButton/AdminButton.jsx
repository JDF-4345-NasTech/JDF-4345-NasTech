import './AdminButton.css';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function AdminButton({ setCloseAdminButton, closeAdminButton }) {
  const { user, isAuthenticated } = useAuth0();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [existingOrg, setExistingOrg] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOrganizationName('');
    setOrganizationDescription('');
    setCloseAdminButton(!closeAdminButton);
  };

  const handleInputChange = (e) => {
    setOrganizationName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setOrganizationDescription(e.target.value);
  };

  const checkOrganizationExists = async (name) => {
    console.log('Checking for organization with name:', name);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organization/search?name=${name}`);
      if (!response.ok) {
        throw new Error('Failed to check organization existence');
      }
      const data = await response.json();

      if (data) {
        console.log("found matching org")
        setExistingOrg(data); // If organization exists, show the modal to request join
        setIsJoinModalOpen(true); // Open the join request modal
      } else {
        setExistingOrg(null); // Organization does not exist
      }
    } catch (error) {
      console.error('Error checking organization existence:', error);
      alert('Error checking organization.');
    }
  };

  const handleCreateOrganization = async () => {
    if (!organizationName) {
      alert('Please provide an organization name.');
      return;
    }

    if (!organizationDescription) {
      alert('Please provide an organization description.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organizationName,
          description: organizationDescription,
          userId: user.name,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        closeModal();
      } else if (response.status === 409) {
        console.log("org exists")
        checkOrganizationExists(organizationName);
      } else {
        alert(result.error || 'Failed to create organization.');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('An error occurred while creating the organization.');
    }
  };

  const handleRequestToJoin = () => {
    if (existingOrg) {
      fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${existingOrg.id}/request-join`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.name,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(() => {
          alert('Request to join organization sent!');
          setIsJoinModalOpen(false);
        })
        .catch(error => {
          console.error('Error sending join request:', error);
          alert('Error sending join request.');
        });
    }
  };

  const closeJoinModal = () => {
    setIsJoinModalOpen(false);
    setOrganizationName('');
    setOrganizationDescription('');
  };

  return (
    <>
      <button className="partOfOrgButton" onClick={openModal}>
        Create organization
      </button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create a page for your organization</h2>
            <input
              type="text"
              placeholder="Enter your organization's name"
              value={organizationName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              placeholder="Enter a brief description of your organization"
              value={organizationDescription}
              onChange={handleDescriptionChange}
            />
            <button onClick={handleCreateOrganization}>Create Organization</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
      {isJoinModalOpen && existingOrg && (
        <div className="modal">
          <div className="modal-content">
            <h2>Organization already exists</h2>
            <p>{existingOrg.name} is an existing organization.</p>
            <button onClick={handleRequestToJoin}>Request to Join</button>
            <button onClick={closeJoinModal}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminButton;
