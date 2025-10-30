import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

const NavBar: React.FC = () => {
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  // Fetch user role from Firebase Realtime Database
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserRole(userData.role || 'customer');
          } else {
            setUserRole('customer'); // Default to customer if no data found
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('customer'); // Default to customer on error
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleLogout = () => {
    logout();
    setUserRole(null); // Reset user role on logout
    navigate('/');
    setLogoutSuccess(true);
  };

  const handleAuthRequiredNavigation = (path: string) => {
    if (!user && !loading) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: path, loginRequired: true } });
    } else {
      // Navigate normally if authenticated
      navigate(path);
    }
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
                {/* Show different navigation based on user role */}
                {userRole === 'professional' ? (
                  <>
                    {/* Professional Navigation */}
                    <Button
                      color="inherit"
                      variant="text"
                      onClick={() => handleAuthRequiredNavigation('/my-assignments')}
                      disabled={loading}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        textTransform: 'none',
                        m: 0,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      {loading ? 'Loading...' : 'My Assignments'}
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                    <IconButton
                      color="inherit"
                      disabled={loading}
                      sx={{ p: 0.5, borderRadius: 2, m: 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                      onClick={() => handleAuthRequiredNavigation('/user-details')}
                    >
                      <AccountCircleIcon sx={{ width: 28, height: 28 }} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                    <Button
                      color="inherit"
                      variant="text"
                      onClick={handleLogout}
                      disabled={loading}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        textTransform: 'none',
                        m: 0,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      {loading ? 'Loading...' : 'LogOut'}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Customer Navigation */}
                    <Button
                      color="inherit"
                      variant="text"
                      onClick={() => handleAuthRequiredNavigation('/service-booking')}
                      disabled={loading}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        textTransform: 'none',
                        m: 0,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      {loading ? 'Loading...' : 'Book New Service'}
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                    <Button
                      color="inherit"
                      variant="text"
                      onClick={() => handleAuthRequiredNavigation('/my-bookings')}
                      disabled={loading}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        textTransform: 'none',
                        m: 0,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      {loading ? 'Loading...' : 'My Bookings'}
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                    <IconButton
                      color="inherit"
                      disabled={loading}
                      sx={{ p: 0.5, borderRadius: 2, m: 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                      onClick={() => handleAuthRequiredNavigation('/user-details')}
                    >
                      <AccountCircleIcon sx={{ width: 28, height: 28 }} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: '#e0e0e0', width: '1px', height: 28 }} />
                    <Button
                      color="inherit"
                      variant="text"
                      onClick={!user && !loading ? () => navigate('/login') : handleLogout}
                      disabled={loading}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        textTransform: 'none',
                        m: 0,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      {loading ? 'Loading...' : !user ? 'Login' : 'LogOut'}
                    </Button>
                  </>
                )}
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
