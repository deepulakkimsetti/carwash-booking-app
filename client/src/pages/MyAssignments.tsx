import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, Snackbar, Alert, CircularProgress, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AssignmentDetail {
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
  customer_id: string;
}

const MyAssignments: React.FC = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; bookingId: string; newStatus: string }>({ open: false, bookingId: '', newStatus: '' });

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

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    // Show confirmation dialog if status is being changed to "completed" or "cancelled"
    const status = newStatus.toLowerCase();
    if (status === 'completed' || status === 'cancelled') {
      setConfirmDialog({ open: true, bookingId, newStatus });
    } else {
      updateBookingStatus(bookingId, newStatus);
    }
  };

  const handleConfirmStatusChange = () => {
    updateBookingStatus(confirmDialog.bookingId, confirmDialog.newStatus);
    setConfirmDialog({ open: false, bookingId: '', newStatus: '' });
  };

  const handleCancelStatusChange = () => {
    setConfirmDialog({ open: false, bookingId: '', newStatus: '' });
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setStatusUpdatingId(bookingId);

      // Call backend endpoint to update booking status.
      const resp = await fetch('https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/updateBookingStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, booking_status: newStatus }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Failed to update booking status');
      }

      // Optimistically update local state
      setAssignments(prev => prev.map(a => a.booking_id === bookingId ? { ...a, booking_status: newStatus } : a));
    } catch (err: any) {
      console.error('Update status error:', err);
      setError(err?.message || 'Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };  // Fetch assigned bookings for the professional
  const fetchAssignments = async () => {
    if (!user) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Firebase UID (alphanumeric) directly as professional identifier
      const professionalId = encodeURIComponent(user.uid);

      const response = await fetch(
        `https://carwash-booking-api-ameuafauczctfndp.eastasia-01.azurewebsites.net/api/getProfessionalAssignments?professional_id=${professionalId}`,
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
          
          let assignmentsData: AssignmentDetail[] = [];
          
          if (Array.isArray(rawData)) {
            // If API returns direct array
            assignmentsData = rawData;
          } else if (rawData && typeof rawData === 'object') {
            // If API returns object, look for common wrapper properties
            if ('data' in rawData && Array.isArray(rawData.data)) {
              assignmentsData = rawData.data;
            } else if ('assignments' in rawData && Array.isArray(rawData.assignments)) {
              assignmentsData = rawData.assignments;
            } else if ('bookings' in rawData && Array.isArray(rawData.bookings)) {
              assignmentsData = rawData.bookings;
            } else if ('results' in rawData && Array.isArray(rawData.results)) {
              assignmentsData = rawData.results;
            } else {
              // Try to use the raw object as array if it has numeric keys
              const values = Object.values(rawData);
              if (values.length > 0 && typeof values[0] === 'object') {
                assignmentsData = values as AssignmentDetail[];
              }
            }
          }
          
          setAssignments(assignmentsData);
        } else {
          // Handle non-JSON response - treat as no assignments found
          setAssignments([]);
        }
      } else {
        // Only show error for actual server errors, not for "no data found" scenarios
        if (response.status >= 500) {
          setError('Server error occurred while loading assignments');
        } else if (response.status === 401 || response.status === 403) {
          setError('Authentication required to view assignments');
        } else {
          setError('Failed to load assignments');
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('An error occurred while loading assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && (location.state.loginSuccess || location.state.signupSuccess)) {
      setOpenSuccess(true);
      // Remove state after showing popup
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading) {
      fetchAssignments();
    }
  }, [user, authLoading]);

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 2, md: 4 } }}>
      {/* Success Snackbar */}
      <Snackbar open={openSuccess} autoHideDuration={2000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {location.state?.signupSuccess ? 'Signup successful!' : 'Login successful!'}
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
          My Assignments
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
              Please log in to view your assignments
            </Typography>
          </Box>
        )}

        {/* No Assignments Message */}
        {!loading && user && assignments.length === 0 && (
          <Box sx={{ width: '100%', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" align="center">
              You have no assignments yet.
            </Typography>
          </Box>
        )}

        {/* Assignments List */}
        {!loading && assignments.length > 0 && (() => {
          const filteredAssignments = assignments.filter(a => {
            const status = (a.booking_status || '').toLowerCase();
            const cancelledStatuses = ['cancelled', 'unavailable', 'not_serviceable'];
            if (tabIndex === 1) {
              return status === 'completed';
            } else if (tabIndex === 2) {
              return cancelledStatuses.includes(status);
            } else {
              return status !== 'completed' && !cancelledStatuses.includes(status);
            }
          });

          if (filteredAssignments.length === 0) {
            return (
              <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                  {tabIndex === 1 
                    ? 'No completed bookings yet. Completed assignments will appear here.' 
                    : tabIndex === 2 
                    ? 'No cancelled bookings. Cancelled assignments will appear here.'
                    : 'No active bookings at the moment.'}
                </Typography>
              </Box>
            );
          }

          return (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', mt: 4 }}>
              {filteredAssignments.map((assignment, idx) => {
              const { date, time } = formatDateTime(assignment.scheduled_time);
              const status = (assignment.booking_status || '').toLowerCase();
              const cancelledStatuses = ['completed', 'cancelled', 'unavailable', 'not_serviceable'];
              const isDropdownDisabled = cancelledStatuses.includes(status) || statusUpdatingId === assignment.booking_id;
              
              return (
                <Card key={idx} sx={{ width: { xs: '100%', sm: '90%', md: '75%' }, minWidth: '700px', background: '#f7f8fa', borderRadius: 3, boxShadow: 3, py: 4, px: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Booking #{assignment.booking_id}
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id={`status-label-${assignment.booking_id}`}>Status of job</InputLabel>
                        <Select
                          labelId={`status-label-${assignment.booking_id}`}
                          value={assignment.booking_status || ''}
                          label="Status of job"
                          onChange={(e) => handleStatusChange(assignment.booking_id, e.target.value as string)}
                          disabled={isDropdownDisabled}
                          displayEmpty={false}
                        >
                          <MenuItem value="assigned">assigned</MenuItem>
                          <MenuItem value="inprogress">inprogress</MenuItem>
                          <MenuItem value="completed">completed</MenuItem>
                          <MenuItem value="cancelled">cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Service: {assignment.service_name || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Car Type: {assignment.car_type || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        City: {assignment.cityName || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Location: {assignment.NearestLocation || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Full Address: {assignment.FullAddress || '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Date: {date}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, mb: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Time: {time}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Service Type: {assignment.service_type || '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Duration: {assignment.duration_minutes ? `${assignment.duration_minutes} minutes` : '-'}
                      </Typography>
                      <Box sx={{ width: '1px', height: '24px', bgcolor: '#ddd' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Price: ₹{assignment.base_price?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ textAlign: 'center' }}>
                        Assigned On: {assignment.created_at ? new Date(assignment.created_at).toLocaleString() : '-'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
              })}
            </Box>
          );
        })()}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelStatusChange}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">
            Confirm Status Change
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              {confirmDialog.newStatus.toLowerCase() === 'completed' 
                ? 'Are you sure you want to mark this booking as completed? This action will update the booking status.'
                : 'Are you sure you want to cancel this booking? This action will update the booking status.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelStatusChange} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} color="primary" variant="contained" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyAssignments;
