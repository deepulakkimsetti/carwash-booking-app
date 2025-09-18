import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth state here if needed
    navigate('/');
  };

  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isSignup = location.pathname === '/signup';

  return (
    <AppBar position="fixed" color="primary" sx={{ width: '100%', m: 0, p: 0 }}>
      <Toolbar sx={{ width: '100%', minWidth: 0, px: 2, m: 0, p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, cursor: 'pointer', pr: 2 }}>
            CarWash Booking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mr: 7 }}>
          {(isHome || isLogin) && (
            <Button color="inherit" component={RouterLink} to="/signup" variant="outlined">
              Signup
            </Button>
          )}
          {(isHome || isSignup) && (
            <Button color="inherit" component={RouterLink} to="/login" variant="outlined">
              Login
            </Button>
          )}
          {!isHome && !isLogin && !isSignup && (
            <Button color="inherit" variant="outlined" onClick={handleLogout}>
              LogOut
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
