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

  // localStorage.removeItem('username');
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
};

const register = async (userData) => {
  const response = await http.post('/auth/supplier_register/', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

const VerifyOtp = async (otp) => {
  const username = JSON.parse(localStorage.getItem('username'));
  const userData = {
    username: username,
    otp: otp,
  };
  const data = JSON.stringify(userData);
  // userData.username = username;

  const response = await http.post('/auth/verify-otp/', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.data.status === '200') {
    // localStorage.removeItem('username');
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  login,
  register,
  externalLogin,
  logout,
  VerifyOtp,
};

export default authService;
