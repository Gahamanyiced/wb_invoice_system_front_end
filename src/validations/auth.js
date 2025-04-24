// src/validationSchema.js
import * as Yup from 'yup';

// Staff login validation
export const loginValidation = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9._-]+(@rwandair\.com)?$/, 'Invalid username format')
    .max(30, 'Username must be at most 30 characters long'),
  password: Yup.string()
    .required('Password is required')
    .max(30, 'Password must be at most 30 characters long'),
});

// Supplier login validation
export const supplierLoginValidation = Yup.object().shape({
  username: Yup.string()
    .required('Email is required')
    .email('Invalid email address')
    .max(50, 'Email must be at most 50 characters long'),
  password: Yup.string()
    .required('Password is required')
    .max(30, 'Password must be at most 30 characters long'),
});

export const otpValidation = Yup.object().shape({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});
