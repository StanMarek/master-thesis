import { useAuth0 } from '@auth0/auth0-react';
import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import MeshPage from './pages/Mesh';
import { MeshAnalytics } from './pages/MeshAnalytics';
import { Profile } from './pages/Profile';
import { SocketEventName, SocketResponseType } from './util/ws';

export let socket: Socket = io();

export function App() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const connectSocketIo = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        if (socket && socket.connected) {
          handleSocketMessage();
        }
        if (!socket || !socket.connected) {
          socket = io('ws://localhost:3001/ws-events', {
            autoConnect: true,
            auth: {
              token: `Bearer ${token}`,
            },
          });
          handleSocketMessage();
        }
      }
    };
    connectSocketIo();
  }, [isAuthenticated, getAccessTokenSilently]);

  function handleSocketMessage() {
    socket.on(SocketEventName.CONNECTED, (data: SocketResponseType<SocketEventName.CONNECTED>) => {
      if (data.status) {
        setSnackbarSeverity('success');
        setSnackbarMessage(`Connected to WebSocket server. ClientID: ${data.data.clientId}`);
        setSnackbarOpen(true);
      }
    });
    socket.on(
      SocketEventName.KAFKA_CHECK,
      (data: SocketResponseType<SocketEventName.KAFKA_CHECK>) => {
        if (data.status) {
          setSnackbarSeverity('success');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        } else {
          setSnackbarSeverity('error');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        }
      },
    );
    socket.on(
      SocketEventName.CALCULATE_MESH_START,
      (data: SocketResponseType<SocketEventName.CALCULATE_MESH_START>) => {
        if (data.status) {
          setSnackbarSeverity('success');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        } else {
          setSnackbarSeverity('error');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        }
      },
    );
    socket.on(
      SocketEventName.CALCULATE_MESH_END,
      (data: SocketResponseType<SocketEventName.CALCULATE_MESH_END>) => {
        if (data.status) {
          setSnackbarSeverity('success');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        } else {
          setSnackbarSeverity('error');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        }
      },
    );
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<MeshAnalytics />} />
          <Route path="/mesh/:id" element={<MeshPage />} />
        </Routes>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Footer />
      </div>
    </Router>
  );
}
