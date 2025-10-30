
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Snackbar, Alert, Checkbox, FormControl, InputLabel, Select, MenuItem, OutlinedInput, ListItemText } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';

const locationOptions = {
  Hyderabad: ['HiTech City', 'Madhapur', 'Gachibowli', 'Lingampally', 'Ameenpur', 'Kukatpally', 'Bachupally', 'Miyapur', 'Kondapur', 'Manikonda', 'Narsingi', 'Serilingampally'],
  Bangalore: ['MG Road', 'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Electronic City', 'Sarjapur Road', 'Yelahanka', 'Hebbal']
};

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  const [city, setCity] = useState('');
  const [nearestLocations, setNearestLocations] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);
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



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !phone || !address || !email || !password) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save user info to Realtime Database
      const userData: any = {
        fullName,
        phone,
        address,
        email,
        role
      };
      
      // Add professional-specific fields if role is professional
      if (role === 'professional') {
        userData.city = city;
        userData.nearestLocations = nearestLocations;
      }
      
      await set(ref(db, 'users/' + user.uid), userData);
      
      // Logout the user after signup to require login
      await auth.signOut();
      
      // Navigate to login page
      setTimeout(() => {
        navigate('/login', { state: { signupSuccess: true, message: 'Signup successful! Please login to continue.' } });
      }, 500);
    } catch (err: any) {
      setError(err.message);
      setOpenError(true);
    }
  };



  return (
  <Container maxWidth={false} disableGutters sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0, mt: 1 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, minWidth: 450, maxWidth: 550, width: '100%' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Signup
        </Typography>
  <Box component="form" noValidate autoComplete="off" onSubmit={handleSignup}>
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
          
          {/* Email and Password Side by Side */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </Box>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Signup
          </Button>

        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
