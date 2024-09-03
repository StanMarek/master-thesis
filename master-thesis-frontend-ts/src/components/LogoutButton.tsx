import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { socket } from '../App';

export const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    localStorage.removeItem('auth0:id_token');
  }, [logout]);

  return (
    <Button
      variant="contained"
      color="error"
      onClick={() => {
        logout({ logoutParams: { returnTo: window.location.origin } });
        disconnectSocketIo();
        localStorage.clear();
      }}
      sx={{
        mt: 1,
      }}
    >
      Log Out
    </Button>
  );
};

const disconnectSocketIo = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export default LogoutButton;
