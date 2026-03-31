import http from '../../http-common';

// ==================== Department / Section Signing Flow ====================

const getAllSigningFlow = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(`/invoice/all_levels/?${queryParams}`);
  return response.data;
};

const getAllSigningFlowByDepartment = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );
  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();
  const response = await http.get(
    `/invoice/department_signing_levels/?${queryParams}`,
  );
  return response.data;
};

const addSigningFlow = async (data) => {
  const response = await http.post('/invoice/create_levels/', data);
  return response.data;
};

const editSigningFlow = async (data) => {
  const response = await http.post('/invoice/approval_levels/update/', data);
  return response.data;
};

// ==================== Cost Center Signing Flow ====================
// POST   /invoice/cost-center-signers/                — single or bulk create
// GET    /invoice/cost-center-signers/                 — list all
// GET    /invoice/cost-center-signers/?cost_center_id=1 — filter by CC
// PUT    /invoice/cost-center-signers/{id}/            — update order
// DELETE /invoice/cost-center-signers/{id}/            — delete signer (body: { order })

const getAllCostCenterSigners = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/cost-center-signers/${query ? `?${query}` : ''}`,
  );
  return response.data;
};

const createCostCenterSigner = async (data) => {
  // data can be single: { cost_center, signer, order }
  // or bulk:            { cost_center, signers: [{ signer, order }] }
  const response = await http.post('/invoice/cost-center-signers/', data);
  return response.data;
};

const updateCostCenterSigner = async (id, data) => {
  // payload: { order: 2 }
  const response = await http.put(`/invoice/cost-center-signers/${id}/`, data);
  return response.data;
};

const deleteCostCenterSigner = async (id, data) => {
  // payload: { order: <signer's level> }
  const response = await http.delete(`/invoice/cost-center-signers/${id}/`, {
    data,
  });
  return response.data;
};

// ==================== Location Signing Flow ====================
// POST   /invoice/location-signers/              — single or bulk create
// GET    /invoice/location-signers/               — list all
// GET    /invoice/location-signers/?location_id=1 — filter by location
// PUT    /invoice/location-signers/{id}/          — update order
// DELETE /invoice/location-signers/{id}/          — delete signer (body: { order })

const getAllLocationSigners = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== ''),
    ),
  ).toString();
  const response = await http.get(
    `/invoice/location-signers/${query ? `?${query}` : ''}`,
  );
  return response.data;
};

const createLocationSigner = async (data) => {
  // data can be single: { location, signer, order }
  // or bulk:            { location, signers: [{ signer, order }] }
  const response = await http.post('/invoice/location-signers/', data);
  return response.data;
};

const updateLocationSigner = async (id, data) => {
  // payload: { order: 2 }
  const response = await http.put(`/invoice/location-signers/${id}/`, data);
  return response.data;
};

const deleteLocationSigner = async (id, data) => {
  // payload: { order: <signer's level> }
  const response = await http.delete(`/invoice/location-signers/${id}/`, {
    data,
  });
  return response.data;
};

const signingFlowService = {
  // Department / Section
  getAllSigningFlow,
  getAllSigningFlowByDepartment,
  addSigningFlow,
  editSigningFlow,
  // Cost Center
  getAllCostCenterSigners,
  createCostCenterSigner,
  updateCostCenterSigner,
  deleteCostCenterSigner,
  // Location
  getAllLocationSigners,
  createLocationSigner,
  updateLocationSigner,
  deleteLocationSigner,
};

export default signingFlowService;
