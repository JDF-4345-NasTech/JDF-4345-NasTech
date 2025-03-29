import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    return (
        !isAuthenticated && (
            <button style = {{backgroundColor: "#007bff"}} onClick={loginWithRedirect}>
                Sign In
            </button>
        )
    )
  }
  
export default LoginButton