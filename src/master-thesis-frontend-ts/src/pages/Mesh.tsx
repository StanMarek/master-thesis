import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThreeDCanvas } from '../components/Canvas';
import { BASE_API_URL } from '../main';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';

interface MeshCommodity {
  id: string;
  name: string;
  meshId: string;
  visible: boolean;
  fileLineIndex: number;
  tag: string;
  rangeMax?: number;
  rangeMin?: number;
}

interface MeshMetadata {
  id: string;
  owner: string;
  fileId: string;
  verticesCount: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  meshCommodities: MeshCommodity[];
}

interface Vertice {
  x: number;
  y: number;
  z: number;
  value?: number;
  color: string;
}

const MeshPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meshData, setMeshData] = useState<MeshMetadata | null>(null);
  const [vertices, setVertices] = useState<Vertice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchMeshData = async () => {
      const token = await getAccessTokenSilently();
      try {
        const response = await axios.get(`${BASE_API_URL}/mesh/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMeshData(response.data);
      } catch (error) {
        console.error('Error fetching mesh data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeshData();
  }, [id]);

  const fetchVertices = async () => {
    const token = await getAccessTokenSilently();
    try {
      const response = await axios.get(`${BASE_API_URL}/mesh/${id}/vertices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVertices(response.data);
    } catch (error) {
      console.error('Error fetching vertices:', error);
    }
  };

  const handleArchiveCommodity = async (commodityId: string) => {
    const response = await axios
      .patch(
        `${BASE_API_URL}/mesh/commodity-archive/${commodityId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        },
      )
      .then((response) => response.data);

    if (response.status) {
      setMeshData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          meshCommodities: prev.meshCommodities.filter((commodity) => commodity.id !== commodityId),
        };
      });
    }
  };

  const handleCommodityCalculate = async (commodityId: string) => {
    await axios
      .post(
        `${BASE_API_URL}/mesh/commodity-calculate/${commodityId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        },
      )
      .then((response) => response.data);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!meshData) {
    return <Typography variant="h6">No data found</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      {/* Mesh Metadata Section */}
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {meshData.name}
          </Typography>
          <Typography variant="body1">
            <strong>Owner:</strong> {meshData.owner}
          </Typography>
          <Typography variant="body1">
            <strong>Vertices Count:</strong> {meshData.verticesCount}
          </Typography>
          <Typography variant="body1">
            <strong>Created At:</strong> {new Date(meshData.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <strong>Updated At:</strong> {new Date(meshData.updatedAt).toLocaleString()}
          </Typography>
          {meshData.description && (
            <Typography variant="body1">
              <strong>Description:</strong> {meshData.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        3D View
      </Typography>
      {vertices.length === 0 && (
        <Box sx={{ marginBottom: 2 }}>
          <Button variant="contained" color="primary" onClick={fetchVertices}>
            Fetch Vertices
          </Button>
        </Box>
      )}

      {vertices.length > 0 && (
        <Box sx={{ marginBottom: 4 }}>
          <ThreeDCanvas points={vertices} />
        </Box>
      )}

      {/* Mesh Commodities Section */}
      <Typography variant="h6" gutterBottom>
        Mesh Commodities
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Range</TableCell>
              <TableCell>Visible</TableCell>
              <TableCell>File Line Index</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meshData.meshCommodities.map((commodity) => (
              <TableRow key={commodity.id}>
                <TableCell>{commodity.id}</TableCell>
                <TableCell>{commodity.name}</TableCell>
                <TableCell>{commodity.tag}</TableCell>
                <TableCell>
                  [{commodity.rangeMin} - {commodity.rangeMax}]
                </TableCell>
                <TableCell>{commodity.visible ? 'Yes' : 'No'}</TableCell>
                <TableCell>{commodity.fileLineIndex}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleCommodityCalculate(commodity.id)}
                  >
                    <CalculateOutlinedIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleArchiveCommodity(commodity.id)}>
                    <BookmarkRemoveOutlinedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MeshPage;
