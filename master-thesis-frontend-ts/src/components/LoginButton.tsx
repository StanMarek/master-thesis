import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button } from '@mui/material';

export const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return null; // No need to show login button if the user is already authenticated
  }

  return (
    <Box className="center-button" sx={{ textAlign: 'center' }}>
      <Button
        variant="contained"
        color="success"
        onClick={() => {
          loginWithRedirect();
        }}
        sx={{
          mt: 2,
          width: '150px',
          fontSize: '16px',
        }}
      >
        Log In
      </Button>
    </Box>
  );
};

export default LoginButton;
