import http from '../../http-common';

const getInvoiceReport = async (id) => {
  const response = await http.get(`/invoice/generate_invoice_report/${id}/`);
  return response.data;
};

const getAllInvoiceReport = async () => {
  const response = await http.get('/invoice/all-invoice-report/');
  return response.data;
};

const getInvoiceToSignReport = async () => {
  const response = await http.get('/invoice/signer-invoice-report/');
  return response.data;
};

const getUserOwnedInvoiceReport = async () => {
  const response = await http.get('/invoice/user-invoice-report/');
  return response.data;
};

const reportService = {
  getInvoiceReport,
  getAllInvoiceReport,
  getInvoiceToSignReport,
  getUserOwnedInvoiceReport,
};

export default reportService;
