import React from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';

const Login: React.FC = () => {
  return (
  <Container maxWidth={false} disableGutters sx={{ mt: 0, px: 0, width: '100%', minHeight: '100vh' }}>
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Login Page
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
