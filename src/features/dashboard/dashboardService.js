import http from '../../http-common';

const getAllInvoiceByDepartmentAndYear = async (department, year) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = year
    ? `/invoice/department-monthly-invoice-count/${department}/?year=${year}`
    : `/invoice/department-monthly-invoice-count/${department}/`;

  // Make the HTTP request - token will be automatically added by axios interceptor
  const response = await http.get(endpoint);

  return response.data;
};

const getInvoiceOwnedByYear = async (id, year) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = year
    ? `/invoice/invoice-owner-stats/${id}/?year=${year}`
    : `/invoice/invoice-owner-stats/${id}/`;

  // Make the HTTP request - token will be automatically added by axios interceptor
  const response = await http.get(endpoint);

  return response.data;
};

const getInvoiceToSignByYear = async (id, year) => {
  // Construct the endpoint URL based on the presence of `year`
  const endpoint = year
    ? `/invoice/signer-stats/${id}/?year=${year}`
    : `/invoice/signer-stats/${id}/`;

  // Make the HTTP request - token will be automatically added by axios interceptor
  const response = await http.get(endpoint);

  return response.data;
};

const dashboardService = {
  getAllInvoiceByDepartmentAndYear,
  getInvoiceOwnedByYear,
  getInvoiceToSignByYear,
};

export default dashboardService;
