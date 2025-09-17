import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
  <Container maxWidth={false} disableGutters sx={{ mt: 0, px: 0, width: '100%', minHeight: '100vh' }}>
      <Box sx={{ mt: 8, p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Dashboard Page
          </Typography>
          {/* Add dashboard content here */}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
