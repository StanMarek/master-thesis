import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

export function Footer() {
  const { isAuthenticated, user } = useAuth0();
  const [apiVersion, setApiVersion] = useState<string>('Unknown');
  const [apiActive, setApiActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/api-health-check')
      .then((res) => {
        setApiVersion(res.data.version);
        setApiActive(true);
      })
      .catch(() => setApiActive(false))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#343a40',
        color: 'white',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 'auto',
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; 2024 Mesh Master Thesis. All rights reserved.
      </Typography>
      {loading ? (
        <CircularProgress color="inherit" size={20} />
      ) : (
        <>
          <Typography variant="body2" sx={{ mb: 1 }}>
            API Version - {apiVersion}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            API Status - {apiActive ? 'Active' : 'Inactive'}
          </Typography>
        </>
      )}
      {isAuthenticated && user && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={user.picture} alt={user.name} sx={{ width: 30, height: 30 }} />
          <Typography variant="body2">{user.name}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default Footer;
