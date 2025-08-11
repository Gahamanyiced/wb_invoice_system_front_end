// src/utils/reportUtils.js
// Simple utility functions for report generation (no hooks needed)

// Helper function to filter empty values from objects
export const filterEmpty = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
  );

// Build query parameters for report endpoints
export const buildReportQueryParams = (filters, maxRecords = 1000) => {
  const params = new URLSearchParams();

  // Add filters (remove empty values)
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== '') {
      params.append(key, value);
    }
  });

  // Add max records limit (no page parameter for reports)
  params.append('limit', maxRecords.toString());

  return params.toString();
};

// Get report endpoints based on report type
export const getReportEndpoint = (reportType, queryString) => {
  const endpoints = {
    all: `/invoice/all-invoices/?${queryString}`,
    my_invoices: `/invoice/user-invoices/?${queryString}`,
    invoices_to_sign: `/invoice/signer-invoices/?${queryString}`,
    pending: `/invoice/pending-invoices/?${queryString}`,
    approved: `/invoice/approved-invoices/?${queryString}`,
    denied: `/invoice/denied-invoices/?${queryString}`,
    processing: `/invoice/processing-invoices/?${queryString}`,
    forwarded: `/invoice/forwarded-invoices/?${queryString}`,
    rollback: `/invoice/rollback-invoices/?${queryString}`,
    signed: `/invoice/signer-signed-invoices/?${queryString}`,
  };

  return endpoints[reportType] || endpoints.all;
};

// Report type configurations with role-based access
export const reportTypeOptions = [
  { value: 'all', label: 'All Invoices', roles: ['admin'] },
  {
    value: 'my_invoices',
    label: 'My Invoices',
    roles: ['staff', 'supplier', 'admin', 'signer', 'signer_admin'],
  },
  {
    value: 'invoices_to_sign',
    label: 'Invoices to Sign',
    roles: ['signer', 'signer_admin'],
  },
  { value: 'pending', label: 'Pending Invoices', roles: ['admin'] },
  { value: 'approved', label: 'Approved Invoices', roles: ['admin'] },
  { value: 'denied', label: 'Denied Invoices', roles: ['admin'] },
  { value: 'processing', label: 'Processing Invoices', roles: ['admin'] },
  { value: 'forwarded', label: 'Forwarded Invoices', roles: ['admin'] },
  { value: 'rollback', label: 'Rollback Invoices', roles: ['admin'] },
  {
    value: 'signed',
    label: 'Signed Invoices',
    roles: ['signer', 'signer_admin'],
  },
];

// Status options for filtering
export const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'rollback', label: 'Rollback' },
  { value: 'processing', label: 'Processing' },
  { value: 'forwarded', label: 'Forwarded' },
  { value: 'to sign', label: 'To sign' },
  { value: 'signed', label: 'Signed' },
];

// Get filtered report types based on user role
export const getFilteredReportTypes = (userRole) => {
  return reportTypeOptions.filter((type) => type.roles.includes(userRole));
};

// Get report title based on report type
export const getReportTitle = (reportType) => {
  const selectedType = reportTypeOptions.find(
    (type) => type.value === reportType
  );
  return selectedType ? `${selectedType.label} Report` : 'Invoice Report';
};

// Count active filters
export const getActiveFiltersCount = (filters) => {
  return Object.values(filters).filter((value) => value && value !== '').length;
};
