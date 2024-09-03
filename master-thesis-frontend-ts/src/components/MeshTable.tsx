import { useAuth0 } from '@auth0/auth0-react';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BASE_API_URL } from '../main';

// Define the type for file data
interface MeshesData {
  id: number;
  name: string;
  vertices: number;
  commodities: string[];
  actions?: string;
}

// Define the order type
type Order = 'asc' | 'desc';

// Define the head cell type
interface HeadCell {
  id: keyof MeshesData;
  label: string;
  disableSorting?: boolean;
}

const headCells: HeadCell[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'vertices', label: 'Vertices' },
  { id: 'commodities', label: 'Commodities' },
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

export function MeshTable({ refresh }: { refresh: boolean }) {
  const { getAccessTokenSilently } = useAuth0();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof MeshesData>('id');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MeshesData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem('meshTableData');

        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false);
        } else {
          const token = await getAccessTokenSilently();

          const response = await axios.get(`${BASE_API_URL}/mesh`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const fetchedData: MeshesData[] = response.data.map((mesh: any) => ({
            id: mesh.id,
            name: mesh.name,
            vertices: mesh.verticesCount,
            commodities: mesh.commodities,
          }));

          setData(fetchedData);
          localStorage.setItem('meshTableData', JSON.stringify(fetchedData));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, refresh]);

  const handleRequestSort = (property: keyof MeshesData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleVisit = (id: number) => {
    console.log('Edit mesh with ID:', id);
    const url = `/mesh/${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    // Implement edit functionality here
  };

  const handleDelete = async (id: number) => {
    console.log('Delete mesh with ID:', id);
    const token = await getAccessTokenSilently();
    try {
      const response = await axios.delete(`${BASE_API_URL}/mesh/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setData((prevData) => prevData.filter((mesh) => mesh.id !== id));
        localStorage.setItem('meshTableData', JSON.stringify(data));
        refresh = !refresh;
      }
    } catch (error) {
      console.error('Error deleting mesh:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={tableStyles}>
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
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
              <TableCell>{row.vertices}</TableCell>
              <TableCell>
                {row.commodities.map((commodity, index) => (
                  <Chip
                    key={index}
                    label={commodity}
                    sx={{ margin: '2px' }}
                    color="primary" // Use primary color for consistency
                  />
                ))}
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleVisit(row.id)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
