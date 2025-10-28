

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
// import Dashboard from './pages/Dashboard';
import ServiceBooking from './pages/ServiceBooking';
import UserProfile from './pages/UserProfile';
import Services from './pages/Services';
import MyBookings from './pages/MyBookings';
import UserDetails from './pages/UserDetails';
import CaptureDetails from './pages/CaptureDetails';


const AppRouter: React.FC = () => (
  <AuthProvider>
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
    {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    <Route path="/service-booking" element={<ServiceBooking />} />
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/services" element={<Services />} />
    <Route path="/my-bookings" element={<MyBookings />} />
    <Route path="/user-details" element={<UserDetails />} />
    <Route path="/capture-details" element={<CaptureDetails />} />
    </Routes>
    </Router>
  </AuthProvider>
);

export default AppRouter;
