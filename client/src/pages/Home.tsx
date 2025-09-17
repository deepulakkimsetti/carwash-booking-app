import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';

const services = [
  {
    title: 'Exterior Wash',
    description: 'Thorough cleaning of your vehicle’s exterior for a sparkling finish.',
    icon: <LocalCarWashIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
  },
  {
    title: 'Interior Cleaning',
    description: 'Deep cleaning of seats, mats, and dashboard for a fresh interior.',
    icon: <CleaningServicesIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
  },
  {
    title: 'Wax & Polish',
    description: 'Premium waxing and polishing for long-lasting shine and protection.',
    icon: <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
  },
];

const Home: React.FC = () => (
  <Container maxWidth={false} disableGutters sx={{ mt: { xs: 7, sm: 8 }, px: 0, width: '100%', minHeight: '100vh', ml: { xs: 2, sm: 6, md: 10 } }}>
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
        <Typography variant="h2" component="h1" gutterBottom>
          Hyderabad’s Trusted Car Wash & Cleaning Service
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Professional vehicle cleaning at your doorstep. Book a service and experience the best car care in Hyderabad.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" size="large" href="/services">
            View Services
          </Button>
          <Button variant="outlined" color="primary" size="large" href="/dashboard">
            Book Now
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, textAlign: 'center' }}>
        <DirectionsCarIcon sx={{ fontSize: 120, color: 'primary.main' }} />
      </Box>
    </Box>

    {/* Services Section */}
    <Typography variant="h4" component="h2" align="center" gutterBottom>
      Our Services
    </Typography>
    <Grid container spacing={4} sx={{ mb: 8 }}>
      {services.map((service) => (
        <Grid item xs={12} md={4} key={service.title}>
          <Card sx={{ height: '100%', textAlign: 'center', py: 3 }}>
            {service.icon}
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {service.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {service.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Why Choose Us Section */}
    <Box sx={{ mb: 8 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Why Choose Us?
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Experienced Professionals
          </Typography>
          <Typography color="text.secondary">
            Our team is trained to deliver the best cleaning experience for your vehicle.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Eco-Friendly Products
          </Typography>
          <Typography color="text.secondary">
            We use safe and eco-friendly cleaning products for your car and the environment.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Convenient Booking
          </Typography>
          <Typography color="text.secondary">
            Book online and get your car cleaned at your preferred time and location.
          </Typography>
        </Grid>
      </Grid>
    </Box>

    {/* Call to Action */}
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Button variant="contained" color="primary" size="large" href="/dashboard">
        Book Your Car Wash Now
      </Button>
    </Box>
  </Container>
);

export default Home;
