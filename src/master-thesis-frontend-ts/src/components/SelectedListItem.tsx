import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';

import { BorderAll, Folder } from '@mui/icons-material';

interface SelectedListItemProps {
  onSelect: (index: number) => void; // Callback function prop
}

export function SelectedListItem({ onSelect }: SelectedListItemProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    onSelect(index); // Notify parent of the selection change
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <List component="nav" aria-label="main mailbox folders">
        <ListItemButton
          selected={selectedIndex === 0}
          onClick={(event) => handleListItemClick(event, 0)}
        >
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary="Files" />
        </ListItemButton>
        <Divider />
        <ListItemButton
          selected={selectedIndex === 1}
          onClick={(event) => handleListItemClick(event, 1)}
        >
          <ListItemIcon>
            <BorderAll />
          </ListItemIcon>
          <ListItemText primary="Mesh" />
        </ListItemButton>
      </List>
    </Box>
  );
}
