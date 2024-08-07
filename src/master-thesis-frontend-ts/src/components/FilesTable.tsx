import { useAuth0 } from '@auth0/auth0-react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BASE_API_URL } from '../App';

// Define the type for file data
interface FilesData {
  id: string;
  name: string;
  size: string;
  tags: string[];
  createdAt: string;
  actions?: string;
}

interface FileData {
  id: string;
  name: string;
  size: string;
  tags: string[];
  description: string | null;
  createdAt: string;
  format: string;
  originalName: string;
  downloadUrl: string;
  hasMesh: boolean;
}

// Define the order type
type Order = 'asc' | 'desc';

// Define the head cell type
interface HeadCell {
  id: keyof FilesData;
  label: string;
  disableSorting?: boolean;
}

const headCells: HeadCell[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  { id: 'tags', label: 'Tags' },
  { id: 'createdAt', label: 'Date' },
  { id: 'actions', label: 'Actions', disableSorting: true },
];

// Helper functions for sorting
const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = <T,>(order: Order, orderBy: keyof T) => {
  return order === 'desc'
    ? (a: T, b: T) => descendingComparator(a, b, orderBy)
    : (a: T, b: T) => -descendingComparator(a, b, orderBy);
};

const stableSort = <T,>(array: T[], comparator: (a: T, b: T) => number) => {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

// Styles using MUI's sx prop
const tableStyles = {
  '& .MuiTableHead-root': {
    backgroundColor: '#f5f5f5', // Light gray background
  },
  '& .MuiTableCell-head': {
    fontWeight: 'bold',
    color: '#3f51b5', // Primary color for the header text
  },
  '& .MuiTableCell-body': {
    color: '#555', // Darker text for body
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f0f0f0', // Slight hover effect
  },
  '& .MuiIconButton-root': {
    '&:hover': {
      backgroundColor: '#e0e0e0', // Hover color for buttons
    },
  },
};

export function FilesTable({ refresh }: { refresh: boolean }) {
  const { getAccessTokenSilently } = useAuth0();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof FilesData>('id');
  const [data, setData] = useState<FilesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [refreshAfterUpdate, setRefreshAfterUpdate] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FilesData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem('filesTableData');

        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false);
        } else {
          const token = await getAccessTokenSilently();

          const response = await axios.get(`${BASE_API_URL}/file`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const fetchedData = response.data.map((file: any) => ({
            ...file,
            createdAt: new Date(file.createdAt).toUTCString(),
          }));

          setData(fetchedData);
          localStorage.setItem('filesTableData', JSON.stringify(fetchedData));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, refresh, refreshAfterUpdate]);

  const handleRequestSort = (property: keyof FilesData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleConfirmDelete = async () => {
    if (fileToDelete) {
      try {
        await axios.delete(`${BASE_API_URL}/file/${fileToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        });
        setSnackbarMessage('File deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleConfirmDeleteClose();
        handleRefresh();
      } catch (error) {
        console.error('Error deleting file:', error);
        setSnackbarMessage('Error deleting file!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleEdit = async (id: string) => {
    const file = await axios
      .get(`${BASE_API_URL}/file/${id}`, {
        headers: {
          Authorization: `Bearer ${await getAccessTokenSilently()}`,
        },
      })
      .then((response) => response.data);
    setSelectedFile(file);
    setEditedName(file.name);
    setEditedTags(file.tags);
    setEditedDescription(file.description);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedFile(null);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(event.target.value);
  };

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tags = event.target.value.split(',').map((tag) => tag.trim());
    setEditedTags(tags);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDescription(event.target.value);
  };

  const handleSaveChanges = async () => {
    if (selectedFile) {
      const updatedFile = {
        name: editedName,
        tags: editedTags,
        description: editedDescription,
      };

      try {
        const response = await axios.patch(`${BASE_API_URL}/file/${selectedFile.id}`, updatedFile, {
          headers: {
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        });
        console.log('File updated successfully:', response.data);

        setSnackbarMessage('File updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // Trigger a refresh to update the table with the latest data
        handleRefresh();
        // Update UI or state with the new file data if necessary
        handleDialogClose();
      } catch (error) {
        console.error('Error updating file:', error);
        setSnackbarMessage('Error updating file!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleRefresh = () => {
    localStorage.removeItem('filesTableData'); // Clear cache
    setRefreshAfterUpdate((prev) => !prev); // Trigger refresh to fetch new data
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDeleteIconClick = (file: FilesData) => {
    setFileToDelete(file);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setConfirmDeleteOpen(false);
    setFileToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  const handleCalculateMesh = async () => {
    if (selectedFile) {
      try {
        const response = await axios.get(`${BASE_API_URL}/mesh/calculate/${selectedFile.id}`, {
          headers: {
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        });
        console.log('File calculated successfully:', response.data);
        handleDialogClose();
      } catch (error) {
        console.error('Error calculating file:', error);
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <TableContainer component={Paper}>
        <Table sx={tableStyles}>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.disableSorting ? (
                    headCell.label
                  ) : (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(data, getComparator(order, orderBy)).map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.size}</TableCell>
                <TableCell>
                  {row.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      sx={{ margin: '2px' }}
                      color="primary" // Use primary color for consistency
                    />
                  ))}
                </TableCell>
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIconClick(row);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box>
              <TextField
                id="outlined-read-only-input"
                label="ID - Read Only"
                value={selectedFile.id}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                id="outlined-read-only-input"
                label="Original name - Read Only"
                value={selectedFile.originalName}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                id="outlined-helperText"
                fullWidth
                label="Name"
                value={editedName}
                onChange={handleNameChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                // defaultValue={selectedFile.tags.join(', ')}
                value={editedTags.join(', ')}
                onChange={handleTagsChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                // defaultValue={selectedFile.description}
                value={editedDescription || ''}
                onChange={handleDescriptionChange}
                margin="normal"
                multiline
                rows={4}
              />
              <TextField
                id="outlined-read-only-input"
                label="Size - Read Only"
                value={selectedFile.size}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                id="outlined-read-only-input"
                label="Format - Read Only"
                value={selectedFile.format}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                id="outlined-read-only-input"
                label="Created At - Read Only"
                value={new Date(selectedFile.createdAt).toUTCString()}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                href={selectedFile.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download file
              </Button>
              {!selectedFile.hasMesh ? (
                <Button variant="contained" color="warning" onClick={() => handleCalculateMesh()}>
                  Create Mesh
                </Button>
              ) : (
                <Button variant="contained" color="success" disabled>
                  Mesh Created
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={handleConfirmDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{fileToDelete?.name}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDeleteClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
