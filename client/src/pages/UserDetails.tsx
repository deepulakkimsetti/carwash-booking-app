import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Avatar, CircularProgress, Divider } from '@mui/material';
import { auth, db } from '../firebase';
import { onValue, ref } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const UserDetails: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val() || {};
        // Always include name/email/role/phone from auth if missing
        data.name = data.name || currentUser.displayName || '';
        data.email = data.email || currentUser.email || '';
        data.role = data.role || '';
        data.phone = data.phone || '';
        setUser(data);
        setLoading(false);
        // Redirect if Gmail sign-in and missing required fields
        const isGmail = currentUser.providerData.some((p) => p.providerId === 'google.com');
        const missingFields = !data.fullName || !data.phone || !data.address || !data.role;
        if (isGmail && missingFields) {
          navigate('/capture-details');
        }
      });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">No user details found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: { xs: 0, sm: 1 }, textAlign: 'center' }}>
        <Card sx={{ py: 4, px: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
              {user.name ? user.name.charAt(0) : '?'}
            </Avatar>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {user.name}
            </Typography>
            {Object.entries(user)
              .filter(([key]) => key !== 'name')
              .map(([key, value], idx, arr) => (
                <React.Fragment key={key}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
                  </Typography>
                  {idx < arr.length - 1 && <Divider sx={{ my: 1, bgcolor: '#e0e0e0' }} />}
                </React.Fragment>
              ))}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default UserDetails;
