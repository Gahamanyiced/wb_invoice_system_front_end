import http from '../../http-common';

// 1. Petty Cash Issuance

// Issue Petty Cash
const issuePettyCash = async (data) => {
  const response = await http.post('/invoice/petty-cash/issue/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// List All Petty Cash with filters
const getAllPettyCash = async (data) => {
  // Remove empty filters
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );
  const filteredData = filterEmpty(data);

  // Convert to query string
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(`/invoice/petty-cash/list/?${queryParams}`);
  return response.data;
};

// Get Petty Cash by ID
const getPettyCashById = async (id) => {
  const response = await http.get(`/invoice/petty-cash/${id}/`);
  return response.data;
};

// Update Petty Cash
const updatePettyCash = async (id, data) => {
  const response = await http.put(`/invoice/petty-cash/${id}/update/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete Petty Cash
const deletePettyCash = async (id) => {
  const response = await http.delete(`/invoice/petty-cash/${id}/delete/`);
  return response.data;
};

// Rollback Petty Cash Issuance
const rollbackPettyCash = async (id, data) => {
  const response = await http.post(
    `/invoice/petty-cash/${id}/rollback/`,
    data
  );
  return response.data;
};

// 2. Petty Cash Acknowledgment

// Acknowledge Petty Cash Receipt
const acknowledgePettyCash = async (id, data) => {
  const response = await http.post(
    `/invoice/petty-cash/${id}/acknowledge/`,
    data
  );
  return response.data;
};

// 3. Petty Cash Requests

// Create Petty Cash Request
const createPettyCashRequest = async (data) => {
  const response = await http.post(
    '/invoice/petty-cash-request/create/',
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// List All Petty Cash Requests with filters
const getAllPettyCashRequests = async (data) => {
  // Remove empty filters
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );
  const filteredData = filterEmpty(data);

  // Convert to query string
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(
    `/invoice/petty-cash-request/list/?${queryParams}`
  );
  return response.data;
};

// Get Petty Cash Request by ID
const getPettyCashRequestById = async (id) => {
  const response = await http.get(`/invoice/petty-cash-request/${id}/`);
  return response.data;
};

// Update Petty Cash Request
const updatePettyCashRequest = async (id, data) => {
  const response = await http.put(
    `/invoice/petty-cash-request/${id}/update/`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Delete Petty Cash Request
const deletePettyCashRequest = async (id) => {
  const response = await http.delete(
    `/invoice/petty-cash-request/${id}/delete/`
  );
  return response.data;
};

// Track Request
const trackPettyCashRequest = async (id) => {
  const response = await http.get(`/invoice/petty-cash-request/${id}/track/`);
  return response.data;
};

// 4. Sign Request (Verification & Approval)

// Sign Request - Generic signing function
const signPettyCashRequest = async (id, data) => {
  const response = await http.put(
    `/invoice/petty-cash-request/sign/${id}/`,
    data
  );
  return response.data;
};

const pettyCashService = {
  // Petty Cash Issuance
  issuePettyCash,
  getAllPettyCash,
  getPettyCashById,
  updatePettyCash,
  deletePettyCash,
  rollbackPettyCash,

  // Acknowledgment
  acknowledgePettyCash,

  // Petty Cash Requests
  createPettyCashRequest,
  getAllPettyCashRequests,
  getPettyCashRequestById,
  updatePettyCashRequest,
  deletePettyCashRequest,
  trackPettyCashRequest,

  // Signing
  signPettyCashRequest,
};

export default pettyCashService;