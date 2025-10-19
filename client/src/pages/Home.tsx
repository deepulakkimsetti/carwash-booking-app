import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
// ...existing code...
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Grid from '@mui/material/Grid';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';

interface ProductService {
  ProductID: number;
  ProductName: string;
  Price: number;
  ProductDescription: string;
}

// Fallback services data
const fallbackServices = [
  {
    title: 'Basic Wash - fallback',
    description: 'A quick and efficient exterior clean to keep your car looking fresh. Includes high-pressure rinse, foam wash, and spot-free drying — perfect for regular maintenance and a clean drive every time.',
    icon: <LocalCarWashIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    price: 29.99,
  },
  {
    title: 'Premium Wash - fallback',
    description: 'Take your car care up a notch. Our Premium Wash includes everything in the Basic package, plus tire cleaning, wax polish, and interior vacuuming. Ideal for those who want a deeper clean and a showroom shine.',
    icon: <CleaningServicesIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    price: 49.99,
  },
  {
    title: 'Ultimate Detailing - fallback',
    description: 'The full spa treatment for your vehicle. Our Ultimate Detailing service covers exterior polishing, interior shampooing, dashboard conditioning, engine bay cleaning, and ceramic coating options. Designed for car lovers who want nothing but the best.',
    icon: <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    price: 79.99,
  },
];

// Function to get appropriate icon based on service name
const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('basic') || name.includes('wash')) {
    return <LocalCarWashIcon sx={{ fontSize: 60, color: 'primary.main' }} />;
  } else if (name.includes('premium')) {
    return <CleaningServicesIcon sx={{ fontSize: 60, color: 'primary.main' }} />;
  } else {
    return <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main' }} />;
  }
};

const Home: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
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
              icon: getServiceIcon(product.ProductName),
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
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ mt: { xs: 7, sm: 8 }, px: 0, width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
  <Container maxWidth={false} disableGutters sx={{ mt: { xs: 7, sm: 8 }, px: 0, width: '100%', minHeight: '100vh' }}>
    {/* Hero Section */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        gap: 4,
        mb: 8,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ ml: { xs: 2, sm: 6, md: 10 } }}>
          India’s Trusted Car Wash & Cleaning Service
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ ml: { xs: 2, sm: 6, md: 10 } }}>
          Professional vehicle cleaning at your doorstep/workshop. Login and Book a service and experience the best car care in India.
        </Typography>
      </Box>
      <Box sx={{ flex: 1, textAlign: 'center' }}>
        <DirectionsCarIcon sx={{ fontSize: 120, color: 'primary.main' }} />
      </Box>
    </Box>

    {/* Services Section */}
    <Box sx={{ ml: 0 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Our Services
      </Typography>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {services.map((service) => (
          <Grid key={service.id || service.title} item xs={12} sm={8} md={4} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 3, borderRadius: 3, p: 3 }}>
              {service.icon}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>

    {/* Why Choose Us Section */}
    <Box sx={{ mb: 8, mt: 8 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Why Choose Us?
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Typography variant="h6" align="center" gutterBottom>
            Experienced Professionals
          </Typography>
          <Typography color="text.secondary" align="center">
            Our team brings years of hands-on expertise to every wash and detail. From basic cleans to ultimate treatments, your vehicle is in the care of skilled professionals who treat every car like their own.
          </Typography>
        </Grid>
  <Grid item xs={12} md={4}>
          <Typography variant="h6" align="center" gutterBottom>
            Eco-Friendly Products
          </Typography>
          <Typography color="text.secondary" align="center">
            We believe in a clean car and a clean planet. That’s why we use biodegradable soaps, water-saving techniques, and non-toxic detailing products — delivering shine without compromise.
          </Typography>
        </Grid>
  <Grid item xs={12} md={4}>
          <Typography variant="h6" align="center" gutterBottom>
            Convenient Booking
          </Typography>
          <Typography color="text.secondary" align="center">
            Life’s busy. Getting your car cleaned shouldn’t be. With our easy online booking system and flexible time slots, you can schedule your wash in seconds — no waiting, no hassle.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  </Container>
  );
};

export default Home;
