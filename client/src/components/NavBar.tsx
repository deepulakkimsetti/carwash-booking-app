import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NavBar: React.FC = () => (
  <AppBar position="fixed" color="primary" sx={{ width: '100%', m: 0, p: 0 }}>
    <Toolbar sx={{ width: '100%', minWidth: 0, px: 2, m: 0, p: 0 }}>
      <Typography
        variant="h6"
        component={RouterLink}
        to="/"
        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
        CarWash Booking
      </Typography>
  <Box sx={{ display: 'flex', gap: 1, mr: 7 }}>
        <Button color="inherit" component={RouterLink} to="/login">
          Login
        </Button>
        <Button color="inherit" component={RouterLink} to="/signup" variant="outlined">
          Signup
        </Button>
      </Box>
    </Toolbar>
  </AppBar>
);

export default NavBar;
