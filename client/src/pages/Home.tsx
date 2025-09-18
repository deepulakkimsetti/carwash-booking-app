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
          <Grid item xs={12} sm={8} md={4} key={service.title} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 3, borderRadius: 3, p: 3 }}>
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
        Our team is trained to deliver the best cleaning experience for your vehicle.
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" align="center" gutterBottom>
        Eco-Friendly Products
        </Typography>
        <Typography color="text.secondary" align="center">
        We use safe and eco-friendly cleaning products for your car and the environment.
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" align="center" gutterBottom>
        Convenient Booking
        </Typography>
        <Typography color="text.secondary" align="center">
        Book online and get your car cleaned at your preferred time and location.
        </Typography>
      </Grid>
      </Grid>
    </Box>
  </Container>
);

export default Home;
