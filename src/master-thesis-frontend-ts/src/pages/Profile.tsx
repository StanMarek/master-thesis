import { useAuth0 } from '@auth0/auth0-react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { LogoutButton } from '../components/LogoutButton';

export const Profile = () => {
  const { user, isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      {isAuthenticated && user ? (
        <Box
          sx={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            minHeight: '100vh',
          }}
        >
          {/* Profile Header */}
          <Card
            sx={{
              width: '100%',
              padding: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Avatar src={user.picture} alt={user.name} sx={{ width: 80, height: 80 }} />
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user.email}
              </Typography>
              <LogoutButton />
            </Box>
          </Card>

          {/* Account Information */}
          <Card sx={{ width: '100%' }}>
            <CardHeader title="Account Information" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Username:</strong> {user.nickname || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Joined:</strong> {new Date(user.updated_at!).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {user.locale || 'Unknown'}
                </Typography>
                <Typography variant="body1">
                  <strong>Verified:</strong> {user.email_verified ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card sx={{ width: '100%' }}>
            <CardHeader title="Recent Activity" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText primary="Logged in from New York" secondary="2024-08-01" />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText primary="Changed password" secondary="2024-07-25" />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText primary="Updated profile picture" secondary="2024-07-20" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card sx={{ width: '100%' }}>
            <CardHeader title="Settings" />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" sx={{ minWidth: 150 }}>
                  Edit Profile
                </Button>
                <Button variant="contained" color="primary" sx={{ minWidth: 150 }}>
                  Change Password
                </Button>
                <Button variant="contained" color="primary" sx={{ minWidth: 150 }}>
                  Manage Subscriptions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">Please log in to view your profile.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
