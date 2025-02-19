import './AdminButton.css';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function AdminButton({ setCloseAdminButton, closeAdminButton }) {
  const { user, isAuthenticated } = useAuth0();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');

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
      } else {
        alert(result.error || 'Failed to create organization.');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('An error occurred while creating the organization.');
    }
  };


  return (
    <>
      <button onClick={openModal}>
        Part of an organization?
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
    </>
  );
}

export default AdminButton;
