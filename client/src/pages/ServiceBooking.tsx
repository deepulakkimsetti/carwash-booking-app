import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const services = [
  { title: 'Basic Wash', description: 'A quick and efficient exterior clean to keep your car looking fresh. Includes high-pressure rinse, foam wash, and spot-free drying — perfect for regular maintenance and a clean drive every time.', price: 300 },
  { title: 'Premium Wash', description: 'Take your car care up a notch. Our Premium Wash includes everything in the Basic package, plus tire cleaning, wax polish, and interior vacuuming. Ideal for those who want a deeper clean and a showroom shine.', price: 500 },
  { title: 'Ultimate Detailing', description: 'The full spa treatment for your vehicle. Our Ultimate Detailing service covers exterior polishing, interior shampooing, dashboard conditioning, engine bay cleaning, and ceramic coating options. Designed for car lovers who want nothing but the best.', price: 700 },
];

const pricingTable: Record<string, Record<string, number>> = {
  Mini: {
    'Basic Wash': 300,
    'Premium Wash': 500,
    'Ultimate Detail': 700,
  },
  Hatchback: {
    'Basic Wash': 500,
    'Premium Wash': 700,
    'Ultimate Detail': 900,
  },
  Sedan: {
    'Basic Wash': 700,
    'Premium Wash': 1000,
    'Ultimate Detail': 1200,
  },
  MPV: {
    'Basic Wash': 800,
    'Premium Wash': 1100,
    'Ultimate Detail': 1300,
  },
  SUV: {
    'Basic Wash': 700,
    'Premium Wash': 1000,
    'Ultimate Detail': 1200,
  },
};


const steps = ['Select Service', 'Details', 'Confirm'];

const ServiceBooking: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [carType, setCarType] = useState<string>('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state && location.state.loginSuccess) {
      setOpenSuccess(true);
      // Remove state after showing popup
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleConfirmBooking = () => {
    navigate('/my-bookings', { state: { bookingSuccess: true } });
  };

  const handleServiceSelect = (title: string) => {
    setSelectedService(title);
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedService) {
      setActiveStep(1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 2, md: 4 } }}>
      <Snackbar open={openSuccess} autoHideDuration={2000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Login successful!
        </Alert>
      </Snackbar>
      {/* Booking success Snackbar moved to MyBookings page */}
      <Box sx={{
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        minHeight: '80vh',
  mt: { xs: 6, sm: 8, md: 12 },
  display: 'block',
        px: { xs: 1, sm: 2, md: 4 },
        textAlign: 'center'
      }}>
        {/* Static Title and Stepper */}
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
          Book Your Car Wash
        </Typography>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4, width: '100%', mx: 'auto' }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
  {/* Dynamic Step Content */}
        {activeStep === 0 && (
          <>
            <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center' }}>
              {services.map(service => (
                <Box key={service.title} sx={{ width: { xs: '100%', sm: '45%', md: '30%' }, minWidth: 220, maxWidth: 320 }}>
                  <Card
                    sx={{
                      background: selectedService === service.title ? '#23263b' : '#f7f8fa',
                      color: selectedService === service.title ? '#fff' : 'inherit',
                      boxShadow: selectedService === service.title ? 6 : 2,
                      borderRadius: 3,
                      position: 'relative',
                      minHeight: 140,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: 8,
                      }
                    }}
                    onClick={() => handleServiceSelect(service.title)}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {service.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          ₹{service.price.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          *Starting price. Actual price may vary.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5, width: '100%' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 120 }}
                disabled={!selectedService}
                onClick={handleNext}
              >
                Next
              </Button>
            </Box>
          </>
        )}
        {activeStep === 1 && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            {selectedService && (
              <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%' }, mb: 2, textAlign: 'center', background: '#f7f8fa', borderRadius: 2, py: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Selected Service: {selectedService}
                </Typography>
              </Box>
            )}
            <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%' }, p: 0, mb: 2, textAlign: 'center', color: '#23263b' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Details
              </Typography>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%' }, mb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Car Type Centered */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'center' }}>
                  Car Type
                </Typography>
                <select
                  value={carType}
                  onChange={e => setCarType(e.target.value)}
                  style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', width: '220px', background: '#fff', outline: 'none' }}
                >
                  <option value="">Select Car Type</option>
                  <option value="Mini">Mini</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="MPV">MPV</option>
                  <option value="SUV">SUV</option>
                </select>
              </Box>
              {/* Date and Time Side by Side */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                {/* Date */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'left' }}>
                    Date
                  </Typography>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', width: '220px', background: '#fff', outline: 'none' }}
                  />
                </Box>
                {/* Time */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'left' }}>
                    Time
                  </Typography>
                  <select
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', width: '220px', background: '#fff', outline: 'none' }}
                  >
                    <option value="">Select Time</option>
                    {Array.from({ length: 24 * 4 }, (_, i) => {
                      const hour = Math.floor(i / 4);
                      const minute = (i % 4) * 15;
                      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      // Disable past times for today
                      let disabled = false;
                      if (selectedDate === new Date().toISOString().split('T')[0]) {
                        const now = new Date();
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const optionMinutes = hour * 60 + minute;
                        if (optionMinutes <= currentMinutes) disabled = true;
                      }
                      return <option key={timeStr} value={timeStr} disabled={disabled}>{timeStr}</option>;
                    })}
                  </select>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: { xs: '100%', sm: '80%', md: '60%' }, mt: 5 }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 120, m: 0 }}
                onClick={() => setActiveStep(0)}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 120, m: 0 }}
                disabled={!selectedDate || !selectedTime}
                onClick={() => setActiveStep(2)}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, mb: 8 }}>
            <Box sx={{ width: { xs: '100%', sm: '90%', md: '75%' }, minWidth:'700px', mb: 4, textAlign: 'center', background: '#f7f8fa', borderRadius: 3, py: 4, px: 4, boxShadow: 3 }}>
              <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                Confirmation
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Selected Service: {selectedService || '-'}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Car Type: {carType || '-'}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Selected Date: {selectedDate || '-'}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Selected Time: {selectedTime || '-'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Price: {
                    carType && selectedService && pricingTable[carType] && pricingTable[carType][selectedService]
                      ? `₹${pricingTable[carType][selectedService]}`
                      : '-'
                  }
                </Typography>
              </Box>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%' }, display: 'flex', justifyContent: 'space-between', mt: 6 }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 120 }}
                onClick={() => setActiveStep(1)}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                sx={{ borderRadius: 2, fontWeight: 700, minWidth: 120 }}
                onClick={handleConfirmBooking}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default ServiceBooking;

