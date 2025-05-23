import './DiscoveryPage.css';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../LoginButton/LoginButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import AdminButton from './AdminButton/AdminButton';
import { useEffect, useState } from 'react';
import NonProfitHome from '../NonProfitHome/NonProfitHome';
import Organizations from '../Organizations/Organizations';
import EventListingPage from '../EventListingPage/EventListingPage';
import EventDetailsPage from '../EventDetailsPage/EventDetailsPage';
import { User } from 'lucide-react';
import DonationPage from '../Donate/DonationPage/DonationPage';
import DonateSuccess from '../Donate/DonateSuccess/DonateSuccess';
import TemplatePage from '../TemplatePage/TemplatePage';
import { BrowserRouter as Router, Route, Switch, Link, useParams } from 'react-router-dom';

function DiscoveryPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [adminOrg, setAdminOrg] = useState(0);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [closeAdminButton, setCloseAdminButton] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      checkUser(user);
    }
  }, [isAuthenticated, isLoading, user, closeAdminButton]);

  const checkUser = async (user) => {
    try {
      await addUserToDatabase(user);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/user/${user.name}`);
      if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);
      const userData = await response.json();
      setIsOrgAdmin(userData.isOrgAdmin);
      if (userData.isOrgAdmin) setAdminOrg(userData.organizationId);
      await fetchInvitations(user.name);
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setIsUserChecked(true);
    }
  };

  const fetchInvitations = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/invitations/${userId}`);
      const data = await res.json();
      setInvitations(data);
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    }
  };

  const addUserToDatabase = async (user) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.name })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const myOrgClick = () => {
    window.location.href = "/";
  };

  const templateClick = () => {
    window.location.href = "/templates";
  };

  const handleAcceptInvite = async () => {
    const orgId = invitations[0].id;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/userAdmin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.name,
          isOrgAdmin: true,
          organizationId: orgId,
        }),
      });

      await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/invitations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.name, organizationId: orgId })
      });

      setShowInviteModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDeclineInvite = async () => {
    const orgId = invitations[0].id;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/invitations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.name, organizationId: orgId })
      });
      setShowInviteModal(false);
      setInvitations([]);
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    }
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
            {invitations.length > 0 && !isOrgAdmin && (
              <span className="notification-dot"></span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="dropdown-content">
              {isAuthenticated ? (
                <>
                  <p>{user.name}</p>
				  {invitations.length > 0 && !isOrgAdmin && (
                    <button className="invite-pulse" onClick={() => setShowInviteModal(true)}>
                      New invite
                    </button>
                  )}
                  {!isOrgAdmin && isUserChecked && (
                    <AdminButton style={{ backgroundColor: "#007bff" }} setCloseAdminButton={setCloseAdminButton} closeAdminButton={closeAdminButton} />
                  )}

                  {isOrgAdmin && (
                    <>
                      <button style={{ backgroundColor: "#007bff" }} onClick={myOrgClick}>My Org</button>
                      <button style={{ backgroundColor: "#007bff" }} onClick={templateClick}>Templates</button>
                    </>
                  )}
                </>
              ) : (
                <LoginButton style={{ backgroundColor: "#007bff" }} />
              )}
              <LogoutButton />
            </div>
          )}
        </div>

        {showInviteModal && invitations[0] && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close-button" onClick={() => setShowInviteModal(false)}>×</span>
              <p><strong>{invitations[0].name}</strong> has invited you to be an admin for their organization.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="send-button" onClick={handleAcceptInvite}>Accept</button>
                <button className="send-button" onClick={handleDeclineInvite}>Decline</button>
              </div>
            </div>
          </div>
        )}

        <Switch>
          <Route exact path="/">
            <main>
              {isOrgAdmin ? <NonProfitHome orgId={adminOrg} /> : <Organizations />}
            </main>
          </Route>
          <Route path="/organizations/:orgId/events" exact>
            <EventListingPage />
          </Route>
          <Route path="/organizations/:orgId/events/:eventId" component={EventDetailsPage} />
          <Route path="/donate/:eventId" component={DonationPage} />
          <Route path="/success" component={DonateSuccess} />
          <Route path="/templates">
            <TemplatePage orgId={adminOrg} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function EventListingWrapper() {
  const { orgId } = useParams();
  return <EventListingPage orgId={orgId} />;
}

export default DiscoveryPage;