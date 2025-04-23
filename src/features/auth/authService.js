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
    localStorage.setItem('token', response.data.tokens.access);
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  login,
  logout,
  VerifyOtp,
};

export default authService;
