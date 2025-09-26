// src/validations/invoice.js
import * as Yup from 'yup';

// Base validation schema for fields that both suppliers and staff need to validate
const baseInvoiceValidation = {
  invoice_number: Yup.string()
    .required('Invoice number is required')
    .max(50, 'Invoice number must be at most 50 characters long'),
  reference: Yup.string()
    .max(100, 'Reference must be at most 100 characters long')
    .nullable()
    .optional(),
  invoice_date: Yup.date()
    .typeError('Please enter a valid invoice date')
    .nullable()
    .optional(),
  service_period: Yup.string()
    .required('Service period is required')
    .max(100, 'Service period must be at most 100 characters long'),
  currency: Yup.string().required('Currency is required'),
  amount: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a number')
    .positive('Amount must be positive'),
  quantity: Yup.string()
    .max(50, 'Quantity must be at most 50 characters long')
    .nullable()
    .optional(),
};

// Additional fields for staff/admin users
const staffValidationFields = {
  ...baseInvoiceValidation,
  supplier_number: Yup.string().required('Supplier is required'),
  supplier_name: Yup.string().required('Supplier name is required'),
  // For single GL mode
  gl_code: Yup.string().when('$useMultipleGL', {
    is: false,
    then: (schema) => schema.required('GL Code is required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  gl_description: Yup.string().nullable().optional(),
  cost_center: Yup.string().when('$useMultipleGL', {
    is: false,
    then: (schema) => schema.required('Cost Center is required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  location: Yup.string().when('$useMultipleGL', {
    is: false,
    then: (schema) => schema.required('Location is required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  aircraft_type: Yup.string().nullable().optional(),
  route: Yup.string().nullable().optional(),
  payment_terms: Yup.string().required('Payment terms is required'),
  payment_due_date: Yup.date()
    .typeError('Please enter a valid date')
    .nullable()
    .optional(),
  // For multiple GL mode - these will be arrays
  gl_amount: Yup.mixed().nullable().optional(),
  // Validation for signer selection (handled in component logic)
  next_signers_validator: Yup.string().nullable().optional(),
};

// Supplier validation schema
export const supplierInvoiceValidation = Yup.object().shape(
  baseInvoiceValidation
);

// Staff/Admin validation schema
export const staffInvoiceValidation = Yup.object().shape(staffValidationFields);

// Function to determine which validation schema to use based on user role
export const getInvoiceValidationSchema = (userRole) => {
  return userRole === 'supplier'
    ? supplierInvoiceValidation
    : staffInvoiceValidation;
};
