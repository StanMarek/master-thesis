import { useAuth0 } from '@auth0/auth0-react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilesTable } from '../components/FilesTable';
import { MeshTable } from '../components/MeshTable';
import { SelectedListItem } from '../components/SelectedListItem';

import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Styles for the entire page
const pageStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    padding: 4,
    height: '100%',
  },
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: '100%',
  },
  listContainer: {
    flexShrink: 0,
    width: '250px',
    backgroundColor: '#fff',
    boxShadow: 1,
    padding: 2,
    borderRadius: 1,
    marginRight: 2,
    height: '100%',
  },
  tableContainer: {
    flexGrow: 1,
    boxShadow: 3,
    backgroundColor: 'white',
    padding: 2,
    borderRadius: 1,
    height: '100%',
  },
  uploadButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    height: '200px',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    padding: '20px',
    textAlign: 'center',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  dropzoneText: {
    color: '#888',
    marginTop: 1,
  },
  fileList: {
    width: '100%',
    marginTop: 2,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

export function MeshAnalytics() {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [refresh, setRefresh] = useState(false); // State to trigger refresh

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFile(null);
  };

  const handleDrop = (acceptedFile: File) => {
    setFile(acceptedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    const formData = new FormData();

    if (file) formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/api/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
        },
      });
      console.log('Files uploaded successfully:', response.data);

      if (response.data.status) {
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleCloseDialog();
      } else {
        setSnackbarMessage('Failed to upload files.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }

      handleRefresh();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setSnackbarMessage(
        `An error occurred during upload. ${error.response?.data?.message} ${error.response?.data?.error}`,
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRefresh = () => {
    localStorage.removeItem('filesTableData'); // Clear cache
    localStorage.removeItem('meshTableData'); // Clear cache
    setRefresh((prev) => !prev); // Trigger refresh to fetch new data
  };

  return (
    <Box sx={pageStyles.container}>
      <Box sx={pageStyles.mainContent}>
        {/* Left Sidebar for List */}
        <Box sx={pageStyles.listContainer}>
          <SelectedListItem onSelect={setSelectedIndex} />
        </Box>

        {/* Right Main Content */}
        <Box sx={pageStyles.tableContainer}>
          <Box sx={pageStyles.uploadButtonContainer}>
            {selectedIndex === 0 && (
              <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                Upload File
              </Button>
            )}
            <Button variant="outlined" color="primary" onClick={handleRefresh}>
              Refresh
            </Button>
          </Box>

          {selectedIndex === 0 ? <FilesTable refresh={refresh} /> : <MeshTable refresh={refresh} />}
        </Box>
      </Box>

      {/* Upload Dialog */}
      {selectedIndex === 0 && (
        <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle>Upload Files</DialogTitle>
          <DialogContent>
            <DropzoneArea onDrop={handleDrop} file={file!} onRemoveFile={handleRemoveFile} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpload} color="primary" disabled={!file}>
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar for feedback */}
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
    </Box>
  );
}

function DropzoneArea({
  onDrop,
  file,
  onRemoveFile,
}: {
  onDrop: (acceptedFile: File) => void;
  file: File;
  onRemoveFile: (fileName: string) => void;
}) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      onDrop(acceptedFiles[0]);
    },
    // accept: 'image/*,application/pdf',
  });

  return (
    <Box>
      <Box {...getRootProps()} sx={pageStyles.dropzone}>
        <input {...getInputProps()} />
        <Typography variant="body1">Drag & drop files here, or click to select files</Typography>
        <Typography variant="body2" sx={pageStyles.dropzoneText}>
          (Only VTK will be accepted)
        </Typography>
      </Box>
      {file && (
        <List sx={pageStyles.fileList}>
          {[file].map((file) => (
            <ListItem key={file!.name} sx={pageStyles.listItem}>
              <ListItemIcon>
                <InsertDriveFileIcon />
              </ListItemIcon>
              <ListItemText
                primary={file?.name}
                secondary={`${(file?.size / 1024).toFixed(2)} KB`}
              />
              <IconButton edge="end" onClick={() => onRemoveFile(file?.name)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default MeshAnalytics;
