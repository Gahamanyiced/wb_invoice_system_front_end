import http from '../../http-common';

const getAllInvoice = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(`/invoice/all-invoices/?${queryParams}`);
  return response.data;
};

const getAllPendingInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllApprovedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/approved-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/approved-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllDeniedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllRollBackedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/rollback-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/rollback-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllProcessingInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/processing-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/processing-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllForwardedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/forwarded-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/forwarded-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getInvoiceByUser = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(`/invoice/user-invoices/?${queryParams}`);
  return response.data;
};

const getUserPendingInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/user-pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserApprovedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/user-approved-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-approved-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserDeniedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/user-denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserRollBackedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/user-rollback-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-rollback-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserProcessingInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/user-processing-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-processing-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getUserForwardedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/user-forwarded-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/user-forwarded-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const addInvoice = async (data) => {
  const response = await http.post('/invoice/create-invoice/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const updateInvoice = async (id, data) => {
  const response = await http.put(`/invoice/update-invoice/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(`/invoice/signer-invoices/?${queryParams}`);
  return response.data;
};

const getAllInvoicesWithToSignStatus = async (data) => {
  const endpoint = data.year
    ? `/invoice/signer-to-sign-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-to-sign-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllSignedInvoices = async (data) => {
  const endpoint = data.year
    ? `/invoice/signer-signed-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-signed-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllOwnPendingInvoicesToSign = async (data) => {
  const endpoint = data.year
    ? `/invoice/signer-pending-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-pending-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllOwnApprovedInvoicesToSign = async (page) => {
  const response = await http.get(
    `/invoice/signer-approved-invoices/?page=${page}`,
  );
  return response.data;
};

const getAllOwnDeniedInvoicesToSign = async (data) => {
  const endpoint = data.year
    ? `/invoice/signer-denied-invoices/?page=${data.page}&year=${data.year}`
    : `/invoice/signer-denied-invoices/?page=${data.page}`;
  const response = await http.get(endpoint);
  return response.data;
};

const getAllOwnRollbackedInvoicesToSign = async (page) => {
  const response = await http.get(
    `/invoice/signer-rollback-invoices/?page=${page}`,
  );
  return response.data;
};

const getAllOwnProcessingInvoicesToSign = async (page) => {
  const response = await http.get(
    `/invoice/signer-processing-invoices/?page=${page}`,
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
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

const verifyAndTrackInvoice = async (invoiceId) => {
  const response = await http.get(
    `/invoice/verify-and-track-invoice/${invoiceId}/`,
  );
  return response.data;
};

// ── Chain Override ─────────────────────────────────────────────────────────────
// Base: /invoice/invoices/{invoice_id}/chain/

// PUT /invoice/invoices/{id}/chain/replace-signer/
// payload: { history_id, new_signer_id, reason }
const chainReplaceSigner = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/chain/replace-signer/`,
    data,
  );
  return response.data;
};

// PUT /invoice/invoices/{id}/chain/change-status/
// payload (invoice):  { target: 'invoice', new_status, reason }
// payload (history):  { target: 'history', history_id, new_status, reason }
const chainChangeStatus = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/chain/change-status/`,
    data,
  );
  return response.data;
};

// PUT /invoice/invoices/{id}/chain/reorder/
// payload: { order: [history_id, ...], reason }
const chainReorder = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/chain/reorder/`,
    data,
  );
  return response.data;
};

// PUT /invoice/invoices/{id}/chain/insert-signer/
// payload: { signer_id, insert_after_history_id (null = beginning), reason }
const chainInsertSigner = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/chain/insert-signer/`,
    data,
  );
  return response.data;
};

// PUT /invoice/invoices/{id}/chain/remove-signer/
// payload: { history_id, reason }
const chainRemoveSigner = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/chain/remove-signer/`,
    data,
  );
  return response.data;
};

// ── Invoice Number Validation ──────────────────────────────────────────────────
// GET /invoice/check-invoice-number/?invoice_number=INV-001&supplier_id=3
// Returns plain boolean: true = already used, false = available
const checkInvoiceNumber = async ({ invoice_number, supplier_id }) => {
  const params = new URLSearchParams({ invoice_number });
  if (supplier_id) params.append('supplier_id', supplier_id);
  const response = await http.get(
    `/invoice/check-invoice-number/?${params.toString()}`,
  );
  return response.data;
};

const getSupplierInvoices = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(`/invoice/supplier-invoices/?${queryParams}`);
  return response.data;
};

// ── Address Invoice To ────────────────────────────────────────────────────────
// PUT /invoice/invoices/{invoiceId}/address-to/
// payload: { verifier_id, reason }
const addressInvoiceTo = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/address-to/`,
    data,
  );
  return response.data;
};

// ── Rollback Invoice To Supplier ──────────────────────────────────────────────
// PUT /invoice/invoices/{invoiceId}/rollback-to-supplier/
// payload: { status: 'rollback', reason }
const rollbackInvoiceToSupplier = async (invoiceId, data) => {
  const response = await http.put(
    `/invoice/invoices/${invoiceId}/rollback-to-supplier/`,
    data,
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
  // Chain Override
  chainReplaceSigner,
  chainChangeStatus,
  chainReorder,
  chainInsertSigner,
  chainRemoveSigner,
  // Invoice Number Validation
  checkInvoiceNumber,
  // Supplier Invoices
  getSupplierInvoices,
  // Address Invoice To
  addressInvoiceTo,
  // Rollback Invoice To Supplier
  rollbackInvoiceToSupplier,
};

export default invoiceService;
