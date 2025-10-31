import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, Snackbar, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface BookingDetail {
  booking_id: string;
  booking_status: string;
  service_name: string;
  car_type: string;
  cityName: string;
  NearestLocation: string;
  FullAddress: string;
  scheduled_time: string;
  service_type: string;
  duration_minutes: number;
  base_price: number;
  created_at: string;
}

const MyBookings: React.FC = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [openSuccess, setOpenSuccess] = useState(false);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // Helper function to format date and time from scheduled_time
  const formatDateTime = (scheduledTime: string) => {
    try {
      // Parse the datetime string directly without timezone conversion
      const dateTimeParts = scheduledTime.split('T');
      const formattedDate = dateTimeParts[0]; // YYYY-MM-DD
      const timePart = dateTimeParts[1] || '';
      const formattedTime = timePart.split(':').slice(0, 2).join(':'); // HH:MM
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
      const customerId = user.uid; // Use Firebase UID directly as string
      const response = await fetch(
        `https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/getUserBookingDetails?customer_id=${customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok || response.status === 404) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const rawData = await response.json();
          
          let bookingsData: BookingDetail[] = [];
          
          if (Array.isArray(rawData)) {
            // If API returns direct array
            bookingsData = rawData;
          } else if (rawData && typeof rawData === 'object') {
            // If API returns object, look for common wrapper properties
            if ('data' in rawData && Array.isArray(rawData.data)) {
              bookingsData = rawData.data;
            } else if ('bookings' in rawData && Array.isArray(rawData.bookings)) {
              bookingsData = rawData.bookings;
            } else if ('results' in rawData && Array.isArray(rawData.results)) {
              bookingsData = rawData.results;
            } else {
              // Try to use the raw object as array if it has numeric keys
              const values = Object.values(rawData);
              if (values.length > 0 && typeof values[0] === 'object') {
                bookingsData = values as BookingDetail[];
              }
            }
          }
          
          setBookings(bookingsData);
        } else {
          // Handle non-JSON response - treat as no bookings found
          setBookings([]);
        }
      } else {
        // Only show error for actual server errors, not for "no data found" scenarios
        if (response.status >= 500) {
          setError('Server error occurred while loading bookings');
        } else if (response.status === 401 || response.status === 403) {
          setError('Authentication required to view bookings');
        } else {
          setError('Failed to load bookings');
        }
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

        {/* Tabs */}
        <Box sx={{ width: '100%', mt: 2 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} centered>
            <Tab label="Active Bookings" />
            <Tab label="Completed Bookings" />
            <Tab label="Cancelled Bookings" />
          </Tabs>
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
        {!loading && bookings.length > 0 && (() => {
          const filteredBookings = bookings.filter(b => {
            const status = (b.booking_status || '').toLowerCase();
            const cancelledStatuses = ['cancelled', 'unavailable', 'not_serviceable'];
            if (tabIndex === 1) {
              return status === 'completed';
            } else if (tabIndex === 2) {
              return cancelledStatuses.includes(status);
            } else {
              return status !== 'completed' && !cancelledStatuses.includes(status);
            }
          });

          if (filteredBookings.length === 0) {
            return (
              <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                  {tabIndex === 1 
                    ? 'No completed bookings yet. Completed bookings will appear here.' 
                    : tabIndex === 2 
                    ? 'No cancelled bookings. Cancelled bookings will appear here.'
                    : 'No active bookings at the moment.'}
                </Typography>
              </Box>
            );
          }

          return (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', mt: 4 }}>
              {filteredBookings.map((booking, idx) => {
                const { date, time } = formatDateTime(booking.scheduled_time);
                return (
                <Card key={idx} sx={{ width: { xs: '100%', sm: '90%', md: '75%' }, minWidth: '700px', background: '#f7f8fa', borderRadius: 3, boxShadow: 3, py: 4, px: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Booking Id: {booking.booking_id || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Booking Status: {booking.booking_status || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Service: {booking.service_name || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Car Type: {booking.car_type || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        City: {booking.cityName || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Nearest Location: {booking.NearestLocation || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Full Address: {booking.FullAddress || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Selected Date: {date}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Selected Time: {time}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Service Type: {booking.service_type || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Duration: {booking.duration_minutes ? `${booking.duration_minutes} minutes` : '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Price: ₹{booking.base_price?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ textAlign: 'center' }}>
                        Booking Created: {booking.created_at ? new Date(booking.created_at).toLocaleString() : '-'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                );
              })}
            </Box>
          );
        })()}
      </Box>
    </Container>
  );
};

export default MyBookings;
