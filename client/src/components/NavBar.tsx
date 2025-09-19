import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';

const NavBar: React.FC = () => {
  const [logoutSuccess, setLogoutSuccess] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
  // Clear any auth state here if needed
  navigate('/');
  setLogoutSuccess(true);
  };

  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isSignup = location.pathname === '/signup';

  return (
    <>
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
          <Box sx={{ display: 'flex', gap: 2, mr: 7, alignItems: 'center' }}>
            {(isHome || isSignup) && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                variant="text"
                sx={{
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                }}
              >
                Login
              </Button>
            )}
            {!isHome && !isLogin && !isSignup && (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/service-booking"
                  variant="text"
                  sx={{
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    m: 0,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  Book New Service
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/my-bookings"
                  variant="text"
                  sx={{
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    m: 0,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  My Bookings
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                <IconButton
                  color="inherit"
                  sx={{ p: 0.5, borderRadius: 2, m: 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                  onClick={() => navigate('/user-details')}
                >
                  <AccountCircleIcon sx={{ width: 28, height: 28 }} />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                <Button
                  color="inherit"
                  variant="text"
                  onClick={handleLogout}
                  sx={{
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    m: 0,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  LogOut
                </Button>
              </>
            )}
            {(isHome || isLogin) && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/signup"
                variant="text"
                sx={{
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  ml: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                }}
              >
                Signup
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Logout Snackbar */}
      <Snackbar open={logoutSuccess} autoHideDuration={3000} onClose={() => setLogoutSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setLogoutSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Logout successful!
        </Alert>
      </Snackbar>
    </>
  );
};

export default NavBar;
