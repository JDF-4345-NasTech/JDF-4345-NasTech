import { useAuth0 } from '@auth0/auth0-react';

function LogoutButton() {
    const { logout, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && (
            <button style={{ backgroundColor: '#cc2727' }} onClick={logout}>
                Sign Out
            </button>
        )
    )
  }
  
  export default LogoutButton