import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Snackbar, Alert, Card, CardContent, Checkbox, FormControl, InputLabel, Select, MenuItem, OutlinedInput, ListItemText, CircularProgress } from '@mui/material';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';

interface City {
  CityID: number;
  CityName: string;
  StateCode?: string;
}

interface Location {
  LocationID: number;
  LocationName: string;
}

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
  
  // API data states
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const navigate = useNavigate();

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch('https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/getCities', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data: City[] = await response.json();
            setCities(data);
          } else {
            console.error('Cities API returned non-JSON response');
          }
        } else {
          console.error('Failed to fetch cities, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch locations from API when city changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!city) {
        setLocations([]);
        return;
      }

      // Find the selected city object to get its ID
      const selectedCity = cities.find(c => c.CityName === city);
      if (!selectedCity) {
        console.error('Selected city not found in cities array');
        return;
      }

      setLoadingLocations(true);
      try {
        const response = await fetch(`https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/getLocations?cityId=${selectedCity.CityID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data: Location[] = await response.json();
            setLocations(data);
          } else {
            console.error('Locations API returned non-JSON response');
          }
        } else {
          console.error('Failed to fetch locations, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [city, cities]);

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
                      disabled={loadingCities}
                    >
                      <MenuItem value="">
                        <em>{loadingCities ? 'Loading cities...' : 'Select City'}</em>
                      </MenuItem>
                      {cities.map((cityItem) => (
                        <MenuItem key={cityItem.CityID} value={cityItem.CityName}>
                          {cityItem.CityName}
                        </MenuItem>
                      ))}
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
                      disabled={!city || loadingLocations}
                    >
                      {loadingLocations ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading locations...
                        </MenuItem>
                      ) : (
                        locations.map((location) => (
                          <MenuItem key={location.LocationID} value={location.LocationName}>
                            <Checkbox checked={nearestLocations.indexOf(location.LocationName) > -1} />
                            <ListItemText primary={location.LocationName} />
                          </MenuItem>
                        ))
                      )}
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
