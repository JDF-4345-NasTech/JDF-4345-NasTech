import './DiscoveryPage.css';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../LoginButton/LoginButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import AdminButton from './AdminButton/AdminButton';
import { useEffect, useState } from 'react';
import NonProfitHome from '../NonProfitHome/NonProfitHome';
import Organizations from '../Organizations/Organizations';

function DiscoveryPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [adminOrg, setAdminOrg] = useState(0);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [closeAdminButton, setCloseAdminButton] = useState(false);

  // When the user is logged in and it's not loading, check if they're new
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
      console.log(userData);
      setIsOrgAdmin(userData.isOrgAdmin);
      if (userData.isOrgAdmin) {
        setAdminOrg(userData.organizationId);
        console.log(userData.organizationId);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setIsUserChecked(true); // Mark user check as complete
    }
  };

  const addUserToDatabase = async (user) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.name,
        }),
      });
      const result = await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main >
      <LoginButton></LoginButton>
      <LogoutButton></LogoutButton>
      {isAuthenticated && !isOrgAdmin && isUserChecked && <AdminButton setCloseAdminButton={setCloseAdminButton} closeAdminButton={closeAdminButton}></AdminButton>}
      {isOrgAdmin && <NonProfitHome orgId={adminOrg}></NonProfitHome>}
      {!isOrgAdmin && <Organizations></Organizations>}
    </main>
  )
}

export default DiscoveryPage