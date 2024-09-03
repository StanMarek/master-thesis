import { useAuth0 } from '@auth0/auth0-react';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
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
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AxesHelper, BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { BASE_API_URL, BASE_MESH_API_URL } from '../main';

import * as THREE from 'three';

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

interface Edge {
  data: number[];
}

const MeshPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meshData, setMeshData] = useState<MeshMetadata | null>(null);
  const [vertices, setVertices] = useState<Vertice[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
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

  const fetchVerticesAndEdges = async () => {
    const token = await getAccessTokenSilently();
    try {
      // const response = await axios.get(`${BASE_API_URL}/mesh/${id}/vertices`, {
      const response = await axios.get(`${BASE_MESH_API_URL}/mesh/vertices?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEdges(response.data.edges ?? []);
      setVertices(response.data.vertices ?? []);
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
          <Button variant="contained" color="primary" onClick={fetchVerticesAndEdges}>
            Fetch Vertices
          </Button>
        </Box>
      )}

      {(vertices.length > 0 || edges.length > 0) && (
        <Box sx={{ marginBottom: 4 }}>
          <My3DMesh vertices={vertices} edges={edges} />
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

function My3DMesh({ vertices, edges }: { vertices: Vertice[]; edges: Edge[] }) {
  const edgesArray = new Float32Array(edges.map((e) => e.data).flat());

  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', new Float32BufferAttribute(edgesArray, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    color: new Color('#FF5733'),
  });

  const lines = new THREE.LineSegments(edgeGeometry, lineMaterial);

  const spheresGroup = new THREE.Group();

  vertices.forEach((vertex) => {
    const sphereGeometry = new THREE.SphereGeometry(0.2, 4, 4);

    const color = new THREE.Color(vertex.color);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphereMesh.position.set(vertex.x, vertex.y, vertex.z);

    spheresGroup.add(sphereMesh);
  });

  return (
    <Canvas style={{ width: '100%', height: '80vh', background: 'white' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <OrbitControls />
      <primitive object={lines} />
      <primitive object={spheresGroup} /> Render the vertices as points
      <CornerAxesHelper />
    </Canvas>
  );
}

function CornerAxesHelper() {
  const { scene, camera } = useThree();

  const axesHelper = new AxesHelper(5);
  axesHelper.position.set(-7, -7, -7);
  scene.add(axesHelper);

  const size = 50;
  const aspect = window.innerWidth / window.innerHeight;
  const axesCamera = new THREE.OrthographicCamera(
    -size * aspect,
    size * aspect,
    size,
    -size,
    0.1,
    1000,
  );
  axesCamera.position.set(7, 7, 7);
  axesCamera.lookAt(axesHelper.position);

  useEffect(() => {
    const originalAspect = camera.aspect;
    const originalUpdate = camera.updateProjectionMatrix;

    camera.updateProjectionMatrix = () => {
      originalUpdate.call(camera);

      scene.overrideMaterial = null;
      scene.renderWithOrthographicCamera(axesCamera);
    };

    return () => {
      camera.aspect = originalAspect;
      camera.updateProjectionMatrix = originalUpdate;
    };
  }, [scene, camera, axesCamera]);

  return null;
}

export default MeshPage;
