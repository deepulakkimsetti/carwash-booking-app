
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from signup/capture-details
  useEffect(() => {
    const state = location.state as { signupSuccess?: boolean; message?: string } | null;
    if (state?.signupSuccess && state?.message) {
      setSuccessMessage(state.message);
      setOpenSuccess(true);
      // Clear the state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check user role from database
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      
      setTimeout(() => {
        // Route based on user role
        if (userData && userData.role === 'professional') {
          navigate('/my-assignments', { state: { loginSuccess: true } });
        } else {
          navigate('/service-booking', { state: { loginSuccess: true } });
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user profile exists in DB
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);
      const data = snapshot.val();
      setTimeout(() => {
        if (!data || !data.fullName || !data.phone || !data.address || !data.role) {
          navigate('/capture-details');
        } else {
          // Route based on user role
          if (data.role === 'professional') {
            navigate('/my-assignments', { state: { loginSuccess: true } });
          } else {
            navigate('/service-booking', { state: { loginSuccess: true } });
          }
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password.');
      setOpenError(true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      // Optionally, you can show a success message here using error Snackbar
      setError('Password reset email sent!');
      setOpenError(true);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, minWidth: 350, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Login Page
        </Typography>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Snackbar open={openError} autoHideDuration={4000} onClose={() => setOpenError(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={() => setOpenError(false)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
          <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
          <Button onClick={handleGoogleLogin} variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
            Sign in with Google
          </Button>
          <Button onClick={handleForgotPassword} variant="text" color="secondary" fullWidth sx={{ mt: 2 }}>
            Forgot Password?
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
