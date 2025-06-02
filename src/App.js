import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import Invoice from './pages/Invoice';
import User from './pages/User';
import Department from './pages/Department';
import Section from './pages/Section';
import { SigningFlow } from './pages/SigningFlow';
import Register from './pages/Register';
import ProtectedRoute from './ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DownloadPdf from './components/DownloadPdf';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Helper function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const isAuthenticated = () => {
  try {
    // Get access token from cookies instead of localStorage
    const token = getCookie('access_token');

    if (!token) {
      return false;
    }

    const decoded = jwtDecode(token);
    const currentDate = new Date();

    // Check if token is expired
    if (decoded.exp * 1000 < currentDate.getTime()) {
      return false; // Token is expired
    }

    return true; // Token is valid
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute isLoggedIn={isAuthenticated} />}>
            <Route path="/" element={<Invoice />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/department" element={<Department />} />
            <Route path="/section" element={<Section />} />
            <Route path="signing-flow" element={<SigningFlow />} />
            <Route path="download-pdf" element={<DownloadPdf />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
