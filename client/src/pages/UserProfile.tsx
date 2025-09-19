import React from 'react';
import { Container, Box, Typography, Paper, Avatar } from '@mui/material';

const UserProfile: React.FC = () => {
  return (
  <Container maxWidth={false} disableGutters sx={{ mt: 0, px: 0, width: '100%', minHeight: '100vh' }}>
      <Box sx={{ mt: 8, p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            User Profile Page
          </Typography>
          {/* Add user profile and bookings here */}
        </Paper>
      </Box>
    </Container>
  );
};

export default UserProfile;
