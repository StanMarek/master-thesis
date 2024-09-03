import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';
import { LoginButton } from './LoginButton';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export function Navbar() {
  const { isAuthenticated } = useAuth0();
  const location = useLocation();
  const [pageName, setPageName] = useState('Home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Map the current path to a page name
    const mapPageName = () => {
      switch (location.pathname) {
        case '/':
          return 'Home';
        case '/profile':
          return 'Profile';
        case '/analytics':
          return 'Mesh Analytics';
        default:
          return 'Home';
      }
    };

    // Update the pageName state whenever the location changes
    setPageName(mapPageName());
  }, [location.pathname]); // Listen for changes in the path

  // Toggle drawer open/close state
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Drawer component content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        {isAuthenticated && (
          <>
            <ListItem button component={Link} to="/profile">
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button component={Link} to="/analytics">
              <ListItemText primary="Mesh Analytics" />
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Mesh Master Thesis Platform | {pageName}
        </Typography>
        <Button color="inherit" component={Link} to="/">
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </Button>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </AppBar>
  );
}
