import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const MeshPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the ID from the URL

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Details Page</Typography>
      <Typography variant="body1">ID: {id}</Typography>
      {/* Add more content based on the ID */}
    </Box>
  );
};

export default MeshPage;
