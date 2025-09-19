import React from 'react';
import { Container, Box, Typography, Card, CardContent, Snackbar, Alert } from '@mui/material';
import { useLocation } from 'react-router-dom';

const mockBookings = [
  {
    service: 'Ultimate Detail',
    carType: 'MPV',
    date: '2025-09-19',
    time: '21:15',
    price: '₹1300',
  },
];

const MyBookings: React.FC = () => {
  const location = useLocation();
  const [openSuccess, setOpenSuccess] = React.useState(false);

  React.useEffect(() => {
    if (location.state && location.state.bookingSuccess) {
      setOpenSuccess(true);
      // Remove state after showing popup
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 2, md: 4 } }}>
      <Snackbar open={openSuccess} autoHideDuration={2000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Booking created successfully
        </Alert>
      </Snackbar>
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', minHeight: '80vh', mt: { xs: 6, sm: 8, md: 12 }, display: 'block', px: { xs: 1, sm: 2, md: 4 }, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
          My Bookings
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', mt: 4 }}>
          {mockBookings.map((booking, idx) => (
            <Card key={idx} sx={{ width: { xs: '100%', sm: '90%', md: '75%' }, minWidth: '320px', background: '#f7f8fa', borderRadius: 3, boxShadow: 3, py: 3, px: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                  Confirmed
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Selected Service: {booking.service}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Car Type: {booking.carType}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Selected Date: {booking.date}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Selected Time: {booking.time}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Price: {booking.price}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default MyBookings;
