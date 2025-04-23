import http from '../../http-common';
const getAllInvoice = async (data) => {
  const token = localStorage.getItem('token');

  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/all-invoices/?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllPendingInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllApprovedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/approved-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/approved-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllDeniedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllRollBackedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/rollback-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/rollback-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllProcessingInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/processing-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/processing-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllForwardedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/forwarded-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/forwarded-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getInvoiceByUser = async (data) => {
  const token = localStorage.getItem('token');

  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/user-invoices/?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const getUserPendingInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getUserApprovedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-approved-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-approved-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getUserDeniedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getUserRollBackedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-rollback-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-rollback-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getUserProcessingInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-processing-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-processing-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getUserForwardedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/user-forwarded-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-forwarded-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const addInvoice = async (data) => {
  const token = localStorage.getItem('token');
  const response = await http.post('/invoice/create-invoice/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateInvoice = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.put(`/invoice/update-invoice/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getInvoiceById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get(`/invoice/invoice-detail/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const deleteInvoice = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.delete(`/invoice/delete-invoice/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const trackInvoiceById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get(`/invoice/track-invoice/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const signInvoiceById = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.put(`/invoice/sign-invoice/${id}/`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const commentInvoiceById = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.post(`/invoice/comment-invoice/${id}/`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getInvoiceToSign = async (data) => {
  const token = localStorage.getItem('token');

  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/signer-invoices/?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const getAllInvoicesWithToSignStatus = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-to-sign-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-to-sign-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllSignedInvoices = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-signed-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-signed-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllOwnPendingInvoicesToSign = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllOwnApprovedInvoicesToSign = async (page) => {
  const token = localStorage.getItem('token');
  const response = await http.get(
    `/invoice/signer-approved-invoices/?page=${page}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getAllOwnDeniedInvoicesToSign = async (data) => {
  const token = localStorage.getItem('token');
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = data.year
    ? `/invoice/signer-denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllOwnRollbackedInvoicesToSign = async (page) => {
  const token = localStorage.getItem('token');
  const response = await http.get(
    `/invoice/signer-rollback-invoices/?page=${page}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getAllOwnProcessingInvoicesToSign = async (page) => {
  const token = localStorage.getItem('token');
  const response = await http.get(
    `/invoice/signer-processing-invoices/?page=${page}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const denyInvoiceById = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.put(
    `/invoice/sign-invoice/${id}/`,
    { status: 'denied', ...data },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const rollbackInvoiceById = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.put(
    `/invoice/sign-invoice/${id}/`,
    { status: 'rollback', ...data },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getInvoiceComments = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get(`/invoice/${id}/comments/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
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
  const token = localStorage.getItem('token');
  const response = await http.get(
    `/invoice/verify-and-track-invoice/${invoiceId}/`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
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
