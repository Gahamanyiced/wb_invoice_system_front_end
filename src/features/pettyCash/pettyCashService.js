import http from '../../http-common';

// 1. Petty Cash Issuance

// Issue Petty Cash
const issuePettyCash = async (data) => {
  const response = await http.post('/invoice/petty-cash/issue/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// List All Petty Cash with filters
const getAllPettyCash = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
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
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Delete Petty Cash
// payload: { comment: string }
const deletePettyCash = async (id, data) => {
  const response = await http.delete(`/invoice/petty-cash/${id}/delete/`, {
    data,
  });
  return response.data;
};

// Rollback Petty Cash Issuance
const rollbackPettyCash = async (id, data) => {
  const response = await http.post(`/invoice/petty-cash/${id}/rollback/`, data);
  return response.data;
};

// 2. Petty Cash Acknowledgment

// Acknowledge Petty Cash Receipt
const acknowledgePettyCash = async (id, data) => {
  const response = await http.post(
    `/invoice/petty-cash/${id}/acknowledge/`,
    data,
  );
  return response.data;
};

// 3. Petty Cash Requests

// Create Petty Cash Request
const createPettyCashRequest = async (data) => {
  const response = await http.post(
    '/invoice/petty-cash-request/create/',
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

// List All Petty Cash Requests with filters
const getAllPettyCashRequests = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(
    `/invoice/petty-cash-request/list/?${queryParams}`,
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
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

// Delete Petty Cash Request
const deletePettyCashRequest = async (id) => {
  const response = await http.delete(
    `/invoice/petty-cash-request/${id}/delete/`,
  );
  return response.data;
};

// Track Request
const trackPettyCashRequest = async (id) => {
  const response = await http.get(`/invoice/petty-cash-request/${id}/track/`);
  return response.data;
};

// 4. Sign Request (Verification & Approval)

const signPettyCashRequest = async (id, data) => {
  const response = await http.put(
    `/invoice/petty-cash-request/sign/${id}/`,
    data,
  );
  return response.data;
};

// ==================== 5. Petty Cash Expenses ====================

// Create Petty Cash Expense
// FormData: petty_cash_id, verifier_id, expenses (JSON string), expense_document_N (files)
const createPettyCashExpense = async (data) => {
  const response = await http.post(
    '/invoice/petty-cash-expense/create/',
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

// Update Petty Cash Expense
const updatePettyCashExpense = async (id, data) => {
  const response = await http.put(
    `/invoice/petty-cash-expense/${id}/update/`,
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

// Delete Petty Cash Expense
// payload: { comment: string }
const deletePettyCashExpense = async (id, data) => {
  const response = await http.delete(
    `/invoice/petty-cash-expense/${id}/delete/`,
    { data },
  );
  return response.data;
};

// List all expenses for a specific petty cash issuance
// GET /invoice/petty-cash/{pettyCashId}/expenses/
const getIssuancePettyCashExpenses = async (pettyCashId) => {
  const response = await http.get(
    `/invoice/petty-cash/${pettyCashId}/expenses/`,
  );
  return response.data;
};

// Track Petty Cash Expense
const trackPettyCashExpense = async (id) => {
  const response = await http.get(`/invoice/petty-cash-expense/${id}/track/`);
  return response.data;
};

// Approve / Deny / Rollback Petty Cash Expense
// payload: { action: 'approve' | 'deny' | 'rollback', comment?: string }
const approvePettyCashExpense = async (id, data) => {
  const response = await http.put(
    `/invoice/petty-cash-expense/${id}/approve/`,
    data,
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

  // Petty Cash Expenses
  createPettyCashExpense,
  updatePettyCashExpense,
  deletePettyCashExpense,
  getIssuancePettyCashExpenses, // scoped to a single issuance
  trackPettyCashExpense,
  approvePettyCashExpense,
};

export default pettyCashService;
