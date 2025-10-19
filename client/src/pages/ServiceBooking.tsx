import React, { useState, useEffect } from 'react';
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
  StepLabel,
  CircularProgress
} from '@mui/material';

interface ProductService {
  ProductID: number;
  ProductName: string;
  Price: number;
  ProductDescription: string;
}

// Fallback services data
const fallbackServices = [
  { title: 'Basic Wash - fallback', description: 'A quick and efficient exterior clean to keep your car looking fresh. Includes high-pressure rinse, foam wash, and spot-free drying — perfect for regular maintenance and a clean drive every time.', price: 301 },
  { title: 'Premium Wash - fallback', description: 'Take your car care up a notch. Our Premium Wash includes everything in the Basic package, plus tire cleaning, wax polish, and interior vacuuming. Ideal for those who want a deeper clean and a showroom shine.', price: 501 },
  { title: 'Ultimate Detailing - fallback', description: 'Our Ultimate Detailing service covers exterior polishing, interior shampooing, dashboard conditioning, engine bay cleaning, and ceramic coating options. Designed for car lovers who want nothing but the best.', price: 701 },
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

const locationOptions = {
  Hyderabad: ['HiTech City', 'Madhapur', 'Gachibowli', 'Lingampally', 'Ameenpur', 'Kukatpally', 'Bachupally', 'Miyapur', 'Kondapur', 'Manikonda', 'Narsingi', 'Serilingampally'],
  Bangalore: ['MG Road', 'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Electronic City', 'Sarjapur Road', 'Yelahanka', 'Hebbal']
};

interface CarType {
  id: string;
  type: string;
}

const ServiceBooking: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [carType, setCarType] = useState<string>('');
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loadingCarTypes, setLoadingCarTypes] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [city, setCity] = useState<string>('');
  const [nearestLocation, setNearestLocation] = useState<string>('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch car types from API
  useEffect(() => {
    const fetchCarTypes = async () => {
      setLoadingCarTypes(true);
      try {
        const response = await fetch('https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/car-details', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('API Response:', data);
            setCarTypes(data);
          } else {
            const text = await response.text();
            console.error('API returned non-JSON response:', text.substring(0, 200));
            // Fallback to hardcoded values if API fails
            setCarTypes([
              { id: 'mini', type: 'Mini' },
              { id: 'hatchback', type: 'Hatchback' },
              { id: 'sedan', type: 'Sedan' },
              { id: 'mpv', type: 'MPV' },
            ]);
          }
        } else {
          console.error('Failed to fetch car types, status:', response.status);
          const text = await response.text();
          console.error('Error response:', text.substring(0, 200));
          // Fallback to hardcoded values if API fails
          setCarTypes([
            { id: 'mini', type: 'Mini' },
            { id: 'hatchback', type: 'Hatchback' },
            { id: 'sedan', type: 'Sedan' },
            { id: 'mpv', type: 'MPV' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching car types:', error);
        // Fallback to hardcoded values if API fails
        setCarTypes([
          { id: 'mini', type: 'Mini' },
          { id: 'hatchback', type: 'Hatchback' },
          { id: 'sedan', type: 'Sedan' },
          { id: 'mpv', type: 'MPV' },
        ]);
      } finally {
        setLoadingCarTypes(false);
      }
    };

    fetchCarTypes();
  }, []);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await fetch('https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/product-details', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Services API Response status:', response.status);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data: ProductService[] = await response.json();
            console.log('Services API Response:', data);
            
            // Transform API data to match our component structure
            const transformedServices = data.map((product) => ({
              title: product.ProductName,
              description: product.ProductDescription,
              price: product.Price,
              id: product.ProductID,
            }));
            
            setServices(transformedServices);
          } else {
            console.error('Services API returned non-JSON response');
            setServices(fallbackServices);
          }
        } else {
          console.error('Failed to fetch services, status:', response.status);
          setServices(fallbackServices);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices(fallbackServices);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

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
            {loadingServices ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
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
            )}
            {!loadingServices && (
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
            )}
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
                  disabled={loadingCarTypes}
                  style={{ 
                    padding: '10px', 
                    fontSize: '16px', 
                    borderRadius: '6px', 
                    border: '1px solid #ccc', 
                    width: '220px', 
                    background: loadingCarTypes ? '#f5f5f5' : '#fff', 
                    outline: 'none',
                    cursor: loadingCarTypes ? 'wait' : 'pointer'
                  }}
                >
                  <option value="">{loadingCarTypes ? 'Loading...' : 'Select Car Type'}</option>
                  {carTypes.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.type}
                    </option>
                  ))}
                </select>
              </Box>
              
              {/* City and Nearest Location Side by Side */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, mb: 2 }}>
                {/* City */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '342px' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'left' }}>
                    City
                  </Typography>
                  <select
                    value={city}
                    onChange={e => {
                      setCity(e.target.value);
                      setNearestLocation(''); // Reset nearest location when city changes
                    }}
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', width: '220px', background: '#fff', outline: 'none' }}
                  >
                    <option value="">Select City</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </Box>
                {/* Nearest Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '342px' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'left' }}>
                    Nearest Location
                  </Typography>
                  <select
                    value={nearestLocation}
                    onChange={e => setNearestLocation(e.target.value)}
                    disabled={!city}
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', width: '220px', background: city ? '#fff' : '#f5f5f5', outline: 'none' }}
                  >
                    <option value="">Select Location</option>
                    {city && locationOptions[city as keyof typeof locationOptions]?.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </Box>
              </Box>
              {/* Date and Time Side by Side */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                {/* Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '342px' }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', width: '342px' }}>
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
                      // Disable past times for today with 1 hour grace period
                      let disabled = false;
                      if (selectedDate === new Date().toISOString().split('T')[0]) {
                        const now = new Date();
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const graceMinutes = 60; // 1 hour grace period
                        const optionMinutes = hour * 60 + minute;
                        if (optionMinutes <= (currentMinutes + graceMinutes)) disabled = true;
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
                disabled={!selectedDate || !selectedTime || !carType || !city || !nearestLocation}
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
                City: {city || '-'}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Nearest Location: {nearestLocation || '-'}
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

