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

// Replenish / Top-Up Petty Cash Issuance
// FormData: notes, issue_date, supporting_document
const replenishPettyCash = async (id, data) => {
  const response = await http.post(
    `/invoice/petty-cash/${id}/replenish/`,
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
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
// payload: { comment: string }
const deletePettyCashRequest = async (id, data) => {
  const response = await http.delete(
    `/invoice/petty-cash-request/${id}/delete/`,
    { data },
  );
  return response.data;
};

// Track Request
const trackPettyCashRequest = async (id) => {
  const response = await http.get(`/invoice/petty-cash-request/${id}/track/`);
  return response.data;
};

// 4. Sign Request (Verification & Approval)

// PUT /invoice/petty-cash-request/sign/{id}/
// Payload: { action, notes, next_approver_id?, final_approval? }
const approvePettyCashRequest = async (id, data) => {
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
const getIssuancePettyCashExpenses = async (pettyCashId, params = {}) => {
  const queryParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const url = `/invoice/petty-cash/${pettyCashId}/expenses/${queryParams ? `?${queryParams}` : ''}`;
  const response = await http.get(url);
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

// Bulk Action on Petty Cash Expenses
// POST /invoice/petty-cash-expense/bulk-action/
// Payload shapes:
//   approve & forward: { expense_ids, action: "approve", notes, next_approver_id }
//   final approval:    { expense_ids, action: "approve", notes, final_approval: true }
//   deny:              { expense_ids, action: "deny",    notes }
//   rollback:          { expense_ids, action: "rollback", notes }
const bulkActionPettyCashExpenses = async (data) => {
  const response = await http.post(
    '/invoice/petty-cash-expense/bulk-action/',
    data,
  );
  return response.data;
};

// Get Issue Comments for a Petty Cash issuance
// GET /invoice/petty-cash/{id}/issue-comments/
const getPettyCashIssueComments = async (id) => {
  const response = await http.get(`/invoice/petty-cash/${id}/issue-comments/`);
  return response.data;
};

// ==================== 6. Export Approved Expenses ====================

// Export approved expenses for a specific petty cash issuance as a file (Excel/PDF)
// GET /invoice/petty-cash/{id}/export-approved-expenses/
const exportApprovedExpenses = async (id) => {
  const response = await http.get(
    `/invoice/petty-cash/${id}/export-approved-expenses/`,
    { responseType: 'blob' },
  );
  return response;
};

// ==================== 7. Requests scoped to a Petty Cash Issuance ====================

// List all petty cash requests / replenishment requests linked to a specific issuance
// GET /invoice/petty-cash/{id}/requests/
const getPettyCashIssuanceRequests = async (id, params = {}) => {
  const queryParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const url = `/invoice/petty-cash/${id}/requests/${queryParams ? `?${queryParams}` : ''}`;
  const response = await http.get(url);
  return response.data;
};

// ==================== 8. Petty Cash Ledger ====================

// Get ledger for a specific petty cash issuance
// GET /invoice/petty-cash/{id}/ledger/
const getPettyCashLedger = async (id) => {
  const response = await http.get(`/invoice/petty-cash/${id}/ledger/`);
  return response.data;
};

// ==================== 9. Petty Cash Report ====================

// GET /invoice/petty-cash/report/
// Params: station, status, date_from, date_to, petty_cash_id, currency, holder_id, is_replenished
const getPettyCashReport = async (params = {}) => {
  const queryParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const url = `/invoice/petty-cash/report/${queryParams ? `?${queryParams}` : ''}`;
  const response = await http.get(url);
  return response.data;
};

// ==================== 10. Petty Cash Dashboard ====================

// GET /invoice/petty-cash/dashboard/
// Params: year, custodian_id, date_from, date_to
const getPettyCashDashboard = async (params = {}) => {
  const queryParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const url = `/invoice/petty-cash/dashboard/${queryParams ? `?${queryParams}` : ''}`;
  const response = await http.get(url);
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
  replenishPettyCash,

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
  approvePettyCashRequest,

  // Petty Cash Issue Comments
  getPettyCashIssueComments,

  // Petty Cash Expenses
  createPettyCashExpense,
  updatePettyCashExpense,
  deletePettyCashExpense,
  getIssuancePettyCashExpenses,
  trackPettyCashExpense,
  approvePettyCashExpense,
  bulkActionPettyCashExpenses,

  // Export
  exportApprovedExpenses,

  // Issuance-scoped requests
  getPettyCashIssuanceRequests,

  // Ledger
  getPettyCashLedger,

  // Report
  getPettyCashReport,

  // Dashboard
  getPettyCashDashboard,
};

export default pettyCashService;
