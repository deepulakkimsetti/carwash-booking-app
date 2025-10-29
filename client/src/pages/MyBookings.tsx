import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface BookingDetail {
  service_name: string;
  car_type: string;
  cityName: string;
  NearestLocation: string;
  FullAddress: string;
  scheduled_time: string;
  service_type: string;
  duration_minutes: number;
  base_price: number;
}

const MyBookings: React.FC = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [openSuccess, setOpenSuccess] = useState(false);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date and time from scheduled_time
  const formatDateTime = (scheduledTime: string) => {
    try {
      const date = new Date(scheduledTime);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedTime = date.toTimeString().split(':').slice(0, 2).join(':'); // HH:MM
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  // Fetch user bookings from API
  const fetchUserBookings = async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const customerId = parseInt(user.uid) || 123;
      const response = await fetch(
        `https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/getUserBookingDetails?customer_id=${customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('User bookings API Response status:', response.status);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data: BookingDetail[] = await response.json();
          console.log('User bookings API Response:', data);
          console.log('Data length:', data.length);
          console.log('About to set bookings state...');
          setBookings(data);
          console.log('Bookings state set successfully');
        } else {
          console.error('User bookings API returned non-JSON response');
          setError('Failed to load bookings');
        }
      } else {
        console.error('Failed to fetch user bookings, status:', response.status);
        setError('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setError('An error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.bookingSuccess) {
      setOpenSuccess(true);
      // Remove state after showing popup
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserBookings();
    }
  }, [user, authLoading]);

  // Debug: Log when bookings state changes
  useEffect(() => {
    console.log('Bookings state changed:', bookings);
    console.log('Bookings length:', bookings.length);
  }, [bookings]);

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 2, md: 4 } }}>
      <Snackbar open={openSuccess} autoHideDuration={2000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Booking created successfully
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', minHeight: '80vh', mt: { xs: 6, sm: 8, md: 12 }, display: 'block', px: { xs: 1, sm: 2, md: 4 }, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
          My Bookings
        </Typography>
        
        {/* Debug Information */}
        <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            Debug: loading={loading.toString()}, user={user ? 'exists' : 'null'}, authLoading={authLoading.toString()}, bookings.length={bookings.length}
          </Typography>
          <Typography variant="caption" display="block">
            Render condition: {(!loading && bookings.length > 0).toString()}
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* No User Message */}
        {!loading && !user && !authLoading && (
          <Box sx={{ width: '100%', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" align="center">
              Please log in to view your bookings
            </Typography>
          </Box>
        )}

        {/* No Bookings Message */}
        {!loading && user && bookings.length === 0 && (
          <Box sx={{ width: '100%', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" align="center">
              You are yet to create bookings with us.
            </Typography>
          </Box>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', mt: 4 }}>
            {bookings.map((booking, idx) => {
              const { date, time } = formatDateTime(booking.scheduled_time);
              return (
                <Card key={idx} sx={{ width: { xs: '100%', sm: '90%', md: '75%' }, minWidth: '700px', background: '#f7f8fa', borderRadius: 3, boxShadow: 3, py: 4, px: 4 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                      Confirmed
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Selected Service: {booking.service_name || '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Car Type: {booking.car_type || '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      City: {booking.cityName || '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Nearest Location: {booking.NearestLocation || '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Full Address: {booking.FullAddress || '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Selected Date: {date}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Selected Time: {time}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Service Type: {booking.service_type || '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Duration: {booking.duration_minutes ? `${booking.duration_minutes} minutes` : '-'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Price: ₹{booking.base_price?.toFixed(2) || '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyBookings;
