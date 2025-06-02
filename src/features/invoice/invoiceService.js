import http from '../../http-common';

const getAllInvoice = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/all-invoices/?${queryParams}`);
  return response.data;
};

const getAllPendingInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllApprovedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/approved-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/approved-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllDeniedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllRollBackedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/rollback-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/rollback-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllProcessingInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/processing-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/processing-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllForwardedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/forwarded-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/forwarded-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getInvoiceByUser = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/user-invoices/?${queryParams}`);

  return response.data;
};

const getUserPendingInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserApprovedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-approved-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-approved-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserDeniedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserRollBackedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-rollback-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-rollback-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserProcessingInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-processing-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-processing-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserForwardedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-forwarded-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-forwarded-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const addInvoice = async (data) => {
  const response = await http.post('/invoice/create-invoice/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const updateInvoice = async (id, data) => {
  const response = await http.put(`/invoice/update-invoice/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const getInvoiceById = async (id) => {
  const response = await http.get(`/invoice/invoice-detail/${id}`);
  return response.data;
};

const deleteInvoice = async (id) => {
  const response = await http.delete(`/invoice/delete-invoice/${id}/`);
  return response.data;
};

const trackInvoiceById = async (id) => {
  const response = await http.get(`/invoice/track-invoice/${id}`);
  return response.data;
};

const signInvoiceById = async (id, data) => {
  const response = await http.put(`/invoice/sign-invoice/${id}/`, data);
  return response.data;
};

const commentInvoiceById = async (id, data) => {
  const response = await http.post(`/invoice/comment-invoice/${id}/`, data);
  return response.data;
};

const getInvoiceToSign = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/signer-invoices/?${queryParams}`);

  return response.data;
};

const getAllInvoicesWithToSignStatus = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-to-sign-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-to-sign-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllSignedInvoices = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-signed-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-signed-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllOwnPendingInvoicesToSign = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllOwnApprovedInvoicesToSign = async (page) => {
  const response = await http.get(
    `/invoice/signer-approved-invoices/?page=${page}`
  );
  return response.data;
};

const getAllOwnDeniedInvoicesToSign = async (data) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllOwnRollbackedInvoicesToSign = async (page) => {
  const response = await http.get(
    `/invoice/signer-rollback-invoices/?page=${page}`
  );
  return response.data;
};

const getAllOwnProcessingInvoicesToSign = async (page) => {
  const response = await http.get(
    `/invoice/signer-processing-invoices/?page=${page}`
  );
  return response.data;
};

const denyInvoiceById = async (id, data) => {
  const response = await http.put(`/invoice/sign-invoice/${id}/`, {
    status: 'denied',
    ...data,
  });
  return response.data;
};

const rollbackInvoiceById = async (id, data) => {
  const response = await http.put(`/invoice/sign-invoice/${id}/`, {
    status: 'rollback',
    ...data,
  });
  return response.data;
};

const getInvoiceComments = async (id) => {
  const response = await http.get(`/invoice/${id}/comments/`);
  return response.data;
};

const verifySignature = async (data) => {
  const response = await http.post('/invoice/verify_signature/', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const verifyAndTrackInvoice = async (invoiceId) => {
  const response = await http.get(
    `/invoice/verify-and-track-invoice/${invoiceId}/`
  );
  return response.data;
};

const invoiceService = {
  getAllInvoice,
  getAllPendingInvoices,
  getAllApprovedInvoices,
  getAllDeniedInvoices,
  getAllRollBackedInvoices,
  getAllProcessingInvoices,
  getAllForwardedInvoices,
  addInvoice,
  updateInvoice,
  getInvoiceById,
  deleteInvoice,
  trackInvoiceById,
  signInvoiceById,
  getInvoiceByUser,
  getUserPendingInvoices,
  getUserApprovedInvoices,
  getUserDeniedInvoices,
  getUserRollBackedInvoices,
  getUserProcessingInvoices,
  getUserForwardedInvoices,
  getInvoiceToSign,
  getAllInvoicesWithToSignStatus,
  getAllSignedInvoices,
  getAllOwnPendingInvoicesToSign,
  getAllOwnApprovedInvoicesToSign,
  getAllOwnDeniedInvoicesToSign,
  getAllOwnRollbackedInvoicesToSign,
  getAllOwnProcessingInvoicesToSign,
  commentInvoiceById,
  denyInvoiceById,
  rollbackInvoiceById,
  getInvoiceComments,
  verifySignature,
  verifyAndTrackInvoice,
};

export default invoiceService;
