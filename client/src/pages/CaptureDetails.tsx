import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Snackbar, Alert, Card, CardContent, Divider } from '@mui/material';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';

const CaptureDetails: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);
  const [success, setSuccess] = useState('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSuccessClose = () => {
    setOpenSuccess(false);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!fullName || !phone || !address) {
      setError('All fields are required.');
      setOpenError(true);
      return;
    }
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('No user logged in.');
        setOpenError(true);
        return;
      }
      await set(ref(db, 'users/' + currentUser.uid), {
        fullName,
        phone,
        address,
        email: currentUser.email,
        role
      });
      setSuccess('Details captured successfully!');
      setOpenSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0, mt: 4 }}>
      <Card sx={{ minWidth: 350, maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 3, p: 0 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Complete Your Profile
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <Divider sx={{ my: 2 }} />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <Divider sx={{ my: 2 }} />
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              margin="normal"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
            <Divider sx={{ my: 2 }} />
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
          <Divider sx={{ my: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Save Details
          </Button>
        </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CaptureDetails;
