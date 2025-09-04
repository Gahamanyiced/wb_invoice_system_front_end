import axios from 'axios';
import http from '../../http-common';

const login = async (userData) => {
  const response = await http.post('/auth/create-user/', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.data.status === 200) {
    localStorage.setItem('username', JSON.stringify(userData.username));
  }

  return response.data;
};

const externalLogin = async (userData) => {
  const response = await http.post('/auth/external_login/', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Store user data in localStorage if login successful
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

const register = async (userData) => {
  const response = await http.post('/auth/supplier_register/', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Store user data in localStorage if registration successful and user data is returned
  // if (response.data.user) {
  //   localStorage.setItem('user', JSON.stringify(response.data.user));
  // }

  return response.data;
};

const VerifyOtp = async (otp) => {
  const username = JSON.parse(localStorage.getItem('username'));
  const userData = {
    username: username,
    otp: otp,
  };

  const response = await http.post('/auth/verify-otp/', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.data.status === '200') {
    localStorage.removeItem('username');
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

// Logout user - clear both localStorage and cookies
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('username');

  // Clear cookies
  document.cookie =
    'access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  document.cookie =
    'refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
};

const authService = {
  login,
  register,
  externalLogin,
  logout,
  VerifyOtp,
};

export default authService;
