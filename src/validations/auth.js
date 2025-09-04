// src/validations/auth.js
import * as Yup from 'yup';

// Existing validation schemas
export const loginValidation = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9._-]+(@rwandair\.com)?$/, 'Invalid username format')
    .max(30, 'Username must be at most 30 characters long'),
  password: Yup.string()
    .required('Password is required')
    .max(30, 'Password must be at most 30 characters long'),
});

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

// New supplier registration validation schema
export const supplierRegistrationValidation = Yup.object({
  // Account Information
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address')
    .max(50, 'Email must be at most 50 characters long'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(30, 'Password must be at most 30 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  firstname: Yup.string()
    .required('First name is required')
    .max(30, 'First name must be at most 30 characters long'),
  lastname: Yup.string()
    .required('Last name is required')
    .max(30, 'Last name must be at most 30 characters long'),

  // Company Information, Address Information and Payment Information
  profile: Yup.object({
    company_name: Yup.string()
      .required('Company name is required')
      .max(100, 'Company name must be at most 100 characters long'),
    supplier_number: Yup.string()
      .required('Supplier number is required')
      .max(30, 'Supplier number must be at most 30 characters long'),
    tax_id: Yup.string()
      .required('Tax ID is required')
      .max(30, 'Tax ID must be at most 30 characters long'),
    service_category: Yup.string()
      .required('Service category is required')
      .max(50, 'Service category must be at most 50 characters long'),
    contact_name: Yup.string()
      .required('Contact name is required')
      .max(50, 'Contact name must be at most 50 characters long'),
    phone_number: Yup.string()
      .required('Phone number is required')
      .matches(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
        'Invalid phone number format'
      ),

    // Address fields
    street_address: Yup.string()
      .required('Street address is required')
      .max(100, 'Street address must be at most 100 characters long'),
    city: Yup.string()
      .required('City is required')
      .max(50, 'City must be at most 50 characters long'),
    country: Yup.string()
      .required('Country is required')
      .max(50, 'Country must be at most 50 characters long'),

    // Payment fields
    bank_name: Yup.string()
      .required('Bank name is required')
      .max(100, 'Bank name must be at most 100 characters long'),
    account_name: Yup.string()
      .required('Account name is required')
      .max(100, 'Account name must be at most 100 characters long'),
    account_number: Yup.string()
      .required('Account number is required')
      .max(30, 'Account number must be at most 30 characters long'),
    iban: Yup.string().when('$ibanNotApplicable', {
      is: true,
      then: () => Yup.string().notRequired(),
      otherwise: () =>
        Yup.string()
          .required('IBAN is required')
          .test(
            'iban-or-na',
            'IBAN is required or enter N/A',
            function (value) {
              return value === 'N/A' || (value && value.length <= 50);
            }
          ),
    }),
    swift_code: Yup.string().when('$swiftNotApplicable', {
      is: true,
      then: () => Yup.string().notRequired(),
      otherwise: () =>
        Yup.string()
          .required('SWIFT code is required')
          .test(
            'swift-or-na',
            'SWIFT code is required or enter N/A',
            function (value) {
              return value === 'N/A' || (value && value.length <= 20);
            }
          ),
    }),
    sort_code: Yup.string().test(
      'sort-code-validation',
      'Sort code must be at most 20 characters long',
      function (value) {
        if (!value) return true; // Optional field
        return value === 'N/A' || value.length <= 20;
      }
    ),
    payment_currency: Yup.string().required('Payment currency is required'),
  }),
});
