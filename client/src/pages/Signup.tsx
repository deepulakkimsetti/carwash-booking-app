
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);
  const [success, setSuccess] = useState('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const navigate = useNavigate();

  // Handler for success Snackbar close
  const handleSuccessClose = () => {
    setOpenSuccess(false);
    setFullName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setPassword('');
    setRole('customer');
    setTimeout(() => {
      navigate('/login');
    }, 500); // Delay navigation to show Snackbar
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!fullName || !phone || !address || !email || !password) {
      setError('All fields are required.');
      setOpenError(true);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save user info to Realtime Database
      await set(ref(db, 'users/' + user.uid), {
        fullName,
        phone,
        address,
        email,
        role
      });
      setSuccess('Signup successful! You can now log in.');
      setOpenSuccess(true);
      // Do not clear form or navigate yet; wait for Snackbar close
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
      setSuccess('Password reset email sent!');
      setOpenSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };



  return (
  <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0, mt: 15 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, minWidth: 350, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Signup
        </Typography>
  <Box component="form" noValidate autoComplete="off" onSubmit={handleSignup}>
          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select Role
            </Typography>
            <Button
              variant={role === 'customer' ? 'contained' : 'outlined'}
              color="primary"
              sx={{ mr: 2 }}
              onClick={() => setRole('customer')}
            >
              Customer
            </Button>
            <Button
              variant={role === 'professional' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => setRole('professional')}
            >
              Professional
            </Button>
          </Box>
          <Snackbar
            open={openError}
            autoHideDuration={4000}
            onClose={() => setOpenError(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setOpenError(false)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
          <Snackbar
            open={openSuccess}
            autoHideDuration={4000}
            onClose={handleSuccessClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          </Snackbar>
          {success && (
            <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
              {success}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Signup
          </Button>
          <Button onClick={handleForgotPassword} variant="text" color="secondary" fullWidth sx={{ mt: 2 }}>
            Forgot Password?
          </Button>

        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
