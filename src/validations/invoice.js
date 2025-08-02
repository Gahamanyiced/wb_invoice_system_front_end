// src/validations/invoice.js
import * as Yup from 'yup';

// Base validation schema for fields that both suppliers and staff need to validate
// Only validating text input fields, not dropdown/select fields
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
  // Removed currency validation - it's a dropdown select
  amount: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a number')
    .positive('Amount must be positive'),
};

// Additional fields for staff/admin users - Only text input fields are validated
const staffValidationFields = {
  ...baseInvoiceValidation,
  // Removed all dropdown/select field validations:
  // - supplier_number (dropdown)
  // - supplier_name (auto-populated from dropdown selection)
  // - gl_code (dropdown)
  // - gl_description (auto-populated from dropdown selection)
  // - location (dropdown)
  // - cost_center (dropdown)
  // - payment_terms (dropdown)
  // - aircraft_type (dropdown)
  // - route (dropdown)
  // - currency (dropdown)

  // Only keep text input field validations
  quantity: Yup.string()
    .max(50, 'Quantity must be at most 50 characters long')
    .nullable()
    .optional(),
  payment_due_date: Yup.date()
    .typeError('Please enter a valid date')
    .nullable()
    .optional(),
  // Validation for signer selection (handled in component logic)
  next_signers_validator: Yup.string().nullable().optional(),
  // GL amount array for multiple GL mode
  gl_amount: Yup.mixed().nullable().optional(),
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
