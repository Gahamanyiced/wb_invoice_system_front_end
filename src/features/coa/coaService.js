import http from '../../http-common';

// ==================== Suppliers ====================
const getAllSuppliers = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/suppliers/${query ? `?${query}` : ''}`,
  );
  return response.data;
};
const createSupplier = async (data) => {
  const response = await http.post('/invoice/suppliers/', data);
  return response.data;
};
const updateSupplier = async (id, data) => {
  const response = await http.put(`/invoice/suppliers/${id}/`, data);
  return response.data;
};
const deleteSupplier = async (id) => {
  const response = await http.delete(`/invoice/suppliers/${id}/`);
  return response.data;
};

// ==================== Cost Centers ====================
const getAllCostCenters = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/cost-centers/${query ? `?${query}` : ''}`,
  );
  return response.data;
};
const createCostCenter = async (data) => {
  const response = await http.post('/invoice/cost-centers/', data);
  return response.data;
};
const updateCostCenter = async (id, data) => {
  const response = await http.put(`/invoice/cost-centers/${id}/`, data);
  return response.data;
};
const deleteCostCenter = async (id) => {
  const response = await http.delete(`/invoice/cost-centers/${id}/`);
  return response.data;
};

// ==================== GL Accounts ====================
const getAllGLAccounts = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/gl-accounts/${query ? `?${query}` : ''}`,
  );
  return response.data;
};
const createGLAccount = async (data) => {
  const response = await http.post('/invoice/gl-accounts/', data);
  return response.data;
};
const updateGLAccount = async (id, data) => {
  const response = await http.put(`/invoice/gl-accounts/${id}/`, data);
  return response.data;
};
const deleteGLAccount = async (id) => {
  const response = await http.delete(`/invoice/gl-accounts/${id}/`);
  return response.data;
};

// ==================== Locations ====================
const getAllLocations = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/locations/${query ? `?${query}` : ''}`,
  );
  return response.data;
};
const createLocation = async (data) => {
  const response = await http.post('/invoice/locations/', data);
  return response.data;
};
const updateLocation = async (id, data) => {
  const response = await http.put(`/invoice/locations/${id}/`, data);
  return response.data;
};
const deleteLocation = async (id) => {
  const response = await http.delete(`/invoice/locations/${id}/`);
  return response.data;
};

// ==================== Aircraft Types ====================
const getAllAircraftTypes = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/aircraft-types/${query ? `?${query}` : ''}`,
  );
  return response.data;
};
const createAircraftType = async (data) => {
  const response = await http.post('/invoice/aircraft-types/', data);
  return response.data;
};
const updateAircraftType = async (id, data) => {
  const response = await http.put(`/invoice/aircraft-types/${id}/`, data);
  return response.data;
};
const deleteAircraftType = async (id) => {
  const response = await http.delete(`/invoice/aircraft-types/${id}/`);
  return response.data;
};

// ==================== Routes ====================
const getAllRoutes = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/routes/${query ? `?${query}` : ''}`,
  );
  return response.data;
};
const createRoute = async (data) => {
  const response = await http.post('/invoice/routes/', data);
  return response.data;
};
const updateRoute = async (id, data) => {
  const response = await http.put(`/invoice/routes/${id}/`, data);
  return response.data;
};
const deleteRoute = async (id) => {
  const response = await http.delete(`/invoice/routes/${id}/`);
  return response.data;
};

const coaService = {
  // Suppliers
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  // Cost Centers
  getAllCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  // GL Accounts
  getAllGLAccounts,
  createGLAccount,
  updateGLAccount,
  deleteGLAccount,
  // Locations
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  // Aircraft Types
  getAllAircraftTypes,
  createAircraftType,
  updateAircraftType,
  deleteAircraftType,
  // Routes
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
};

export default coaService;
