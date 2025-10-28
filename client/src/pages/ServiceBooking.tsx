import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
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

interface PricingDetail {
  service_id: number;
  service_name: string;
  description: string;
  service_type: string;
  base_price: number;
  duration_minutes: number;
}

interface PricingResponse {
  success: boolean;
  count: number;
  filters: {
    car_id: number;
    product_id: number;
  };
  data: PricingDetail[];
}

// Fallback services data
const fallbackServices = [
  { title: 'Basic Wash - fallback', description: 'A quick and efficient exterior clean to keep your car looking fresh. Includes high-pressure rinse, foam wash, and spot-free drying — perfect for regular maintenance and a clean drive every time.', price: 301 },
  { title: 'Premium Wash - fallback', description: 'Take your car care up a notch. Our Premium Wash includes everything in the Basic package, plus tire cleaning, wax polish, and interior vacuuming. Ideal for those who want a deeper clean and a showroom shine.', price: 501 },
  { title: 'Ultimate Detailing - fallback', description: 'Our Ultimate Detailing service covers exterior polishing, interior shampooing, dashboard conditioning, engine bay cleaning, and ceramic coating options. Designed for car lovers who want nothing but the best.', price: 701 },
];

const pricingTable: Record<string, Record<string, number>> = {
  Mini: {
    'Basic Wash': 301,
    'Premium Wash': 501,
    'Ultimate Detail': 701,
  },
  Hatchback: {
    'Basic Wash': 501,
    'Premium Wash': 701,
    'Ultimate Detail': 901,
  },
  Sedan: {
    'Basic Wash': 701,
    'Premium Wash': 1001,
    'Ultimate Detail': 1201,
  },
  MPV: {
    'Basic Wash': 801,
    'Premium Wash': 1101,
    'Ultimate Detail': 1301,
  },
  SUV: {
    'Basic Wash': 701,
    'Premium Wash': 1001,
    'Ultimate Detail': 1201,
  },
};


const steps = ['Select Service', 'Details', 'Confirm'];

const locationOptions = {
  Hyderabad: ['HiTech City1', 'Madhapur', 'Gachibowli', 'Lingampally', 'Ameenpur', 'Kukatpally', 'Bachupally', 'Miyapur', 'Kondapur', 'Manikonda', 'Narsingi', 'Serilingampally'],
  Bangalore: ['MG Road1', 'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Electronic City', 'Sarjapur Road', 'Yelahanka', 'Hebbal']
};

interface CarType {
  id: string;
  type: string;
}

interface City {
  CityID: number;
  CityName: string;
  StateCode?: string;
}

interface Location {
  LocationID: number;
  LocationName: string;
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
  const [pricingDetails, setPricingDetails] = useState<PricingDetail[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [city, setCity] = useState<string>('');
  const [nearestLocation, setNearestLocation] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Helper function to get the current price for display
  const getCurrentPrice = () => {
    if (currentPrice !== null) {
      return currentPrice;
    }
    
    // Fallback to static pricing table
    if (carType && selectedService && pricingTable[carType] && pricingTable[carType][selectedService]) {
      return pricingTable[carType][selectedService];
    }
    
    return null;
  };

  // Helper function to get additional service details from pricing API
  const getCurrentServiceDetails = () => {
    if (pricingDetails.length > 0) {
      return pricingDetails[0];
    }
    return null;
  };

  // Function to fetch pricing details based on car_id and product_id
  const fetchPricingDetails = async (carId: number, productId: number) => {
    setLoadingPricing(true);
    try {
      const response = await fetch(
        `https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/getServiceDetails?car_id=${carId}&product_id=${productId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Pricing API Response status:', response.status);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data: PricingResponse = await response.json();
          console.log('Pricing API Response:', data);
          
          if (data.success && data.data.length > 0) {
            setPricingDetails(data.data);
            setCurrentPrice(data.data[0].base_price);
          } else {
            console.warn('No pricing data found for the given parameters');
            setCurrentPrice(null);
          }
        } else {
          console.error('Pricing API returned non-JSON response');
          setCurrentPrice(null);
        }
      } else {
        console.error('Failed to fetch pricing details, status:', response.status);
        setCurrentPrice(null);
      }
    } catch (error) {
      console.error('Error fetching pricing details:', error);
      setCurrentPrice(null);
    } finally {
      setLoadingPricing(false);
    }
  };

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

        console.log('Cities API Response status:', response.status);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data: City[] = await response.json();
            console.log('Cities API Response:', data);
            setCities(data);
          } else {
            console.error('Cities API returned non-JSON response');
            // Fallback to hardcoded cities if API fails
            setCities([
              { CityID: 1, CityName: 'Hyderabad1', StateCode: 'TG' },
              { CityID: 2, CityName: 'Bangalore1', StateCode: 'KA' },
            ]);
          }
        } else {
          console.error('Failed to fetch cities, status:', response.status);
          // Fallback to hardcoded cities if API fails
          setCities([
            { CityID: 1, CityName: 'Hyderabad2', StateCode: 'TG' },
            { CityID: 2, CityName: 'Bangalore2', StateCode: 'KA' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Fallback to hardcoded cities if API fails
        setCities([
          { CityID: 1, CityName: 'Hyderabad3', StateCode: 'TG' },
          { CityID: 2, CityName: 'Bangalore3', StateCode: 'KA' },
        ]);
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

        console.log('Locations API Response status:', response.status);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data: Location[] = await response.json();
            console.log('Locations API Response:', data);
            setLocations(data);
          } else {
            console.error('Locations API returned non-JSON response');
            // Fallback to hardcoded locations if API fails
            const fallbackLocations = locationOptions[city as keyof typeof locationOptions] || [];
            setLocations(fallbackLocations.map((name, index) => ({
              LocationID: index + 1,
              LocationName: name
            })));
          }
        } else {
          console.error('Failed to fetch locations, status:', response.status);
          // Fallback to hardcoded locations if API fails
          const fallbackLocations = locationOptions[city as keyof typeof locationOptions] || [];
          setLocations(fallbackLocations.map((name, index) => ({
            LocationID: index + 1,
            LocationName: name
          })));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Fallback to hardcoded locations if API fails
        const fallbackLocations = locationOptions[city as keyof typeof locationOptions] || [];
        setLocations(fallbackLocations.map((name, index) => ({
          LocationID: index + 1,
          LocationName: name
        })));
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [city, cities]); // Fetch locations whenever city or cities array changes

  // Fetch pricing details when both car type and selected service are available
  useEffect(() => {
    if (carType && selectedService) {
      // Find the car ID based on car type
      const selectedCarType = carTypes.find(car => car.type === carType);
      
      // Find the product ID based on selected service
      const selectedServiceObj = services.find(service => service.title === selectedService);
      
      if (selectedCarType && selectedServiceObj) {
        // Convert car type to ID (you may need to adjust this mapping based on your API)
        const carId = typeof selectedCarType.id === 'string' ? parseInt(selectedCarType.id, 10) : selectedCarType.id;
        const productId = selectedServiceObj.id;
        
        console.log('Fetching pricing for car_id:', carId, 'product_id:', productId);
        fetchPricingDetails(carId, productId);
      }
    } else {
      // Reset pricing when car type or service is not selected
      setCurrentPrice(null);
      setPricingDetails([]);
    }
  }, [carType, selectedService, carTypes, services]); // Fetch pricing whenever car type or service changes

  React.useEffect(() => {
    if (location.state && location.state.loginSuccess) {
      setOpenSuccess(true);
      // Remove state after showing popup
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleConfirmBooking = async () => {
    // Debug: Log the current user state
    console.log('Current user state:', user);
    console.log('User exists:', !!user);
    console.log('User UID:', user?.uid);
    console.log('Auth loading state:', loading);
    
    // Wait for auth to finish loading
    if (loading) {
      console.log('Auth still loading, please wait...');
      setBookingError('Authentication loading, please wait...');
      return;
    }
    
    if (!user) {
      console.error('No user found - authentication required');
      setBookingError('Please log in to make a booking. If you just logged in, please refresh the page.');
      return;
    }

    setSubmittingBooking(true);
    setBookingError(null);

    try {
      // Find the selected service object to get service_id
      const selectedServiceObj = services.find(service => service.title === selectedService);
      
      // Find the selected location object to get LocationID
      const selectedLocationObj = locations.find(loc => loc.LocationName === nearestLocation);
      
      // Create the scheduled_time in ISO format
      const scheduledDateTime = `${selectedDate}T${selectedTime}:00`;
      
      // Prepare the request body according to the API specification
      const bookingData = {
        customer_id: parseInt(user.uid) || 123, // Using Firebase UID or fallback
        service_id: selectedServiceObj?.id || 1,
        booking_status: "pending",
        scheduled_time: scheduledDateTime,
        location_address: fullAddress,
        LocationID: selectedLocationObj?.LocationID || 1
      };

      console.log('Submitting booking data:', bookingData);

      const response = await fetch('https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/saveBookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      console.log('Booking API Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Booking saved successfully:', result);
        navigate('/my-bookings', { state: { bookingSuccess: true } });
      } else {
        const errorText = await response.text();
        console.error('Failed to save booking:', errorText);
        setBookingError('Failed to save booking. Please try again.');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      setBookingError('An error occurred while saving the booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
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
      
      {/* Error Snackbar for booking errors */}
      <Snackbar open={!!bookingError} autoHideDuration={6000} onClose={() => setBookingError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setBookingError(null)} severity="error" sx={{ width: '100%' }}>
          {bookingError}
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
                          {selectedService === service.title && getCurrentPrice() !== null ? 
                            `₹${getCurrentPrice()?.toFixed(2)}` : 
                            `₹${service.price.toFixed(2)}`
                          }
                          {loadingPricing && selectedService === service.title && (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                          )}
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
              {/* City and Nearest Location Side by Side */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, mb: 1 }}>
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
                    disabled={loadingCities}
                    style={{ 
                      padding: '10px', 
                      fontSize: '16px', 
                      borderRadius: '6px', 
                      border: '1px solid #ccc', 
                      width: '220px', 
                      background: loadingCities ? '#f5f5f5' : '#fff', 
                      outline: 'none',
                      cursor: loadingCities ? 'wait' : 'pointer'
                    }}
                  >
                    <option value="">{loadingCities ? 'Loading...' : 'Select City'}</option>
                    {cities.map((cityItem) => (
                      <option key={cityItem.CityID} value={cityItem.CityName}>
                        {cityItem.CityName}
                      </option>
                    ))}
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
                    disabled={!city || loadingLocations}
                    style={{ 
                      padding: '10px', 
                      fontSize: '16px', 
                      borderRadius: '6px', 
                      border: '1px solid #ccc', 
                      width: '220px', 
                      background: (!city || loadingLocations) ? '#f5f5f5' : '#fff', 
                      outline: 'none',
                      cursor: (!city || loadingLocations) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">
                      {loadingLocations ? 'Loading...' : 'Select Location'}
                    </option>
                    {locations.map((location) => (
                      <option key={location.LocationID} value={location.LocationName}>
                        {location.LocationName}
                      </option>
                    ))}
                  </select>
                </Box>
              </Box>
              {/* Date and Time Side by Side */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, mb: 1 }}>
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
              
              {/* Car Type and Full Address Side by Side */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6, mb: 2 }}>
                {/* Car Type */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '342px' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'left' }}>
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
                      <option key={car.id} value={car.type}>
                        {car.type}
                      </option>
                    ))}
                  </select>
                </Box>
                {/* Full Address */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '342px' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 120, mr: 2, textAlign: 'left' }}>
                    Full Address
                  </Typography>
                  <textarea
                    value={fullAddress}
                    onChange={e => setFullAddress(e.target.value)}
                    placeholder="Enter full address where service should be availed"
                    style={{
                      padding: '10px',
                      fontSize: '15px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      width: '220px',
                      minHeight: '60px',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
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
                disabled={!selectedDate || !selectedTime || !carType || !city || !nearestLocation || !fullAddress.trim()}
                onClick={() => setActiveStep(2)}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, mb: 4 }}>
            <Box sx={{ width: { xs: '100%', sm: '90%', md: '75%' }, minWidth:'700px', mb: 0, textAlign: 'center', background: '#f7f8fa', borderRadius: 3, py: 4, px: 4, boxShadow: 3 }}>
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
                Full Address: {fullAddress || '-'}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Selected Date: {selectedDate || '-'}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Selected Time: {selectedTime || '-'}
              </Typography>
              {getCurrentServiceDetails() && (
                <>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Service Type: {getCurrentServiceDetails()?.service_type || '-'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Duration: {getCurrentServiceDetails()?.duration_minutes ? `${getCurrentServiceDetails()?.duration_minutes} minutes` : '-'}
                  </Typography>
                </>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Price: {
                    getCurrentPrice() !== null
                      ? `₹${getCurrentPrice()?.toFixed(2)}`
                      : '-'
                  }
                  {loadingPricing && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Typography>
                
                {/* Debug: Authentication Status */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  Auth Status: {loading ? 'Loading...' : user ? `Logged in as ${user.email || user.uid}` : 'Not logged in'}
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
                disabled={submittingBooking || loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </>
                ) : submittingBooking ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : !user ? (
                  'Login Required'
                ) : (
                  'Confirm'
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default ServiceBooking;

