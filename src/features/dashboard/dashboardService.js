import http from '../../http-common';

const getAllInvoiceByDepartmentAndYear = async (department, year) => {
  const endpoint = year
    ? `/invoice/department-monthly-invoice-count/${department}/?year=${year}`
    : `/invoice/department-monthly-invoice-count/${department}/`;
  const response = await http.get(endpoint);
  return response.data;
};

const getInvoiceOwnedByYear = async (id, year) => {
  const endpoint = year
    ? `/invoice/invoice-owner-stats/${id}/?year=${year}`
    : `/invoice/invoice-owner-stats/${id}/`;
  const response = await http.get(endpoint);
  return response.data;
};

const getInvoiceToSignByYear = async (id, year) => {
  const endpoint = year
    ? `/invoice/signer-stats/${id}/?year=${year}`
    : `/invoice/signer-stats/${id}/`;
  const response = await http.get(endpoint);
  return response.data;
};

const getSupplierStats = async (year) => {
  const endpoint = year
    ? `/invoice/supplier-stats/?year=${year}`
    : `/invoice/supplier-stats/`;
  const response = await http.get(endpoint);
  return response.data;
};

// ── Staff Stats ───────────────────────────────────────────────────────────────
// GET /invoice/staff-stats/?year=2025
const getStaffStats = async (year) => {
  const endpoint = year
    ? `/invoice/staff-stats/?year=${year}`
    : `/invoice/staff-stats/`;
  const response = await http.get(endpoint);
  return response.data;
};

const dashboardService = {
  getAllInvoiceByDepartmentAndYear,
  getInvoiceOwnedByYear,
  getInvoiceToSignByYear,
  getSupplierStats,
  getStaffStats,
};

export default dashboardService;
