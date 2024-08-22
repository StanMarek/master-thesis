import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

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

export function DropzoneArea({
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
