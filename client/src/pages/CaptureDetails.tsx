import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Snackbar, Alert, Card, CardContent, Checkbox, FormControl, InputLabel, Select, MenuItem, OutlinedInput, ListItemText } from '@mui/material';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';

const locationOptions = {
  Hyderabad: ['HiTech City', 'Madhapur', 'Gachibowli', 'Lingampally', 'Ameenpur', 'Kukatpally', 'Bachupally', 'Miyapur', 'Kondapur', 'Manikonda', 'Narsingi', 'Serilingampally'],
  Bangalore: ['MG Road', 'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Electronic City', 'Sarjapur Road', 'Yelahanka', 'Hebbal']
};

const CaptureDetails: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [city, setCity] = useState('');
  const [nearestLocations, setNearestLocations] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);
  const [success, setSuccess] = useState('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const navigate = useNavigate();

  // Handler for role change
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    // Reset professional fields when changing role
    if (newRole !== 'professional') {
      setCity('');
      setNearestLocations([]);
    }
  };

  // Handler for city change
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setNearestLocations([]); // Reset locations when city changes
  };

  const handleSuccessClose = () => {
    setOpenSuccess(false);
    setTimeout(() => {
      navigate('/service-booking');
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
    
    // Additional validation for professional role
    if (role === 'professional') {
      if (!city || nearestLocations.length === 0) {
        setError('City and at least one nearest location are required for professionals.');
        setOpenError(true);
        return;
      }
    }
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('No user logged in.');
        setOpenError(true);
        return;
      }
      
      const userData: any = {
        fullName,
        phone,
        address,
        email: currentUser.email,
        role
      };
      
      // Add professional-specific fields if role is professional
      if (role === 'professional') {
        userData.city = city;
        userData.nearestLocations = nearestLocations;
      }
      
      await set(ref(db, 'users/' + currentUser.uid), userData);
      setSuccess('Details captured successfully!');
      setOpenSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0, mt: 0 }}>
      <Card sx={{ minWidth: 550, maxWidth: 700, width: '100%', boxShadow: 3, borderRadius: 3, p: 0 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Complete Your Profile
          </Typography>
          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            {/* Full Name and Phone Number Side by Side */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </Box>
            {/* Address - Full Width */}
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              margin="normal"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select Role
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={role === 'customer' ? 'contained' : 'outlined'}
                color="warning"
                fullWidth
                onClick={() => handleRoleChange('customer')}
              >
                Customer
              </Button>
              <Button
                variant={role === 'professional' ? 'contained' : 'outlined'}
                color="secondary"
                fullWidth
                onClick={() => handleRoleChange('professional')}
              >
                Professional
              </Button>
            </Box>
          </Box>

          {/* Professional-specific fields */}
          {role === 'professional' && (
            <>
              {/* City and Nearest Location Side by Side */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
                {/* City */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    City *
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select City</InputLabel>
                    <Select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value as string)}
                      input={<OutlinedInput label="Select City" />}
                    >
                      <MenuItem value="">
                        <em>Select City</em>
                      </MenuItem>
                      <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                      <MenuItem value="Bangalore">Bangalore</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Nearest Location */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Nearest Locations *
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Nearest Locations</InputLabel>
                    <Select
                      multiple
                      value={nearestLocations}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNearestLocations(typeof value === 'string' ? value.split(',') : value);
                      }}
                      input={<OutlinedInput label="Select Nearest Locations" />}
                      renderValue={(selected) => selected.join(', ')}
                      disabled={!city}
                    >
                      {city && locationOptions[city as keyof typeof locationOptions]?.map((location) => (
                        <MenuItem key={location} value={location}>
                          <Checkbox checked={nearestLocations.indexOf(location) > -1} />
                          <ListItemText primary={location} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </>
          )}
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
            Save Details
          </Button>
        </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CaptureDetails;
