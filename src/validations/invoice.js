// src/validations/invoice.js
import * as Yup from 'yup';

// Base validation schema for fields that both suppliers and staff need to validate
const baseInvoiceValidation = {
  invoice_number: Yup.string()
    .required('Invoice number is required')
    .max(50, 'Invoice number must be at most 50 characters long'),
  service_period: Yup.string()
    .required('Service period is required')
    .max(100, 'Service period must be at most 100 characters long'),
  currency: Yup.string()
    .required('Currency is required'),
  amount: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a number')
    .positive('Amount must be positive'),
};

// Additional fields for staff/admin users
const staffValidationFields = {
  ...baseInvoiceValidation,
  supplier_number: Yup.string()
    .required('Supplier number is required')
    .max(50, 'Supplier number must be at most 50 characters long'),
  supplier_name: Yup.string()
    .max(100, 'Supplier name must be at most 100 characters long'),
  gl_code: Yup.string()
    .required('GL code is required')
    .max(50, 'GL code must be at most 50 characters long'),
  gl_description: Yup.string()
    .max(200, 'GL description must be at most 200 characters long'),
  location: Yup.string()
    .max(100, 'Location must be at most 100 characters long'),
  cost_center: Yup.string()
    .max(50, 'Cost center must be at most 50 characters long'),
  payment_terms: Yup.string()
    .required('Payment terms are required')
    .max(200, 'Payment terms must be at most 200 characters long'),
  payment_due_date: Yup.date()
    .typeError('Please enter a valid date')
    .nullable(),
};

// Supplier validation schema
export const supplierInvoiceValidation = Yup.object().shape(baseInvoiceValidation);

// Staff/Admin validation schema
export const staffInvoiceValidation = Yup.object().shape(staffValidationFields);

// Function to determine which validation schema to use based on user role
export const getInvoiceValidationSchema = (userRole) => {
  return userRole === 'supplier' 
    ? supplierInvoiceValidation 
    : staffInvoiceValidation;
};