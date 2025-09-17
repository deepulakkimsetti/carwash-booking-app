import React from 'react';
import { Container, Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const Services: React.FC = () => {
  return (
  <Container maxWidth={false} disableGutters sx={{ mt: 0, px: 0, width: '100%', minHeight: '100vh' }}>
      <Box sx={{ mt: 8, p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Services Page
          </Typography>
          {/* Example services list */}
          <List>
            <ListItem>
              <ListItemText primary="Exterior Wash" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Interior Cleaning" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Wax & Polish" />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Services;
