import http from '../../http-common';

// ==================== Delegations ====================
// POST   /invoice/delegations/         — create (signer or admin)
// GET    /invoice/delegations/         — list all (supports ?is_active=true)
// PUT    /invoice/delegations/{id}/    — update end_date / reason
// DELETE /invoice/delegations/{id}/    — delete

const getAllDelegations = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== '')
    )
  ).toString();
  const response = await http.get(
    `/invoice/delegations/${query ? `?${query}` : ''}`
  );
  return response.data;
};

const createDelegation = async (data) => {
  // Signer payload:  { substitute, start_date, end_date, reason }
  // Admin payload:   { delegator, substitute, start_date, end_date, reason }
  const response = await http.post('/invoice/delegations/', data);
  return response.data;
};

const updateDelegation = async (id, data) => {
  // Payload: { end_date?, reason? }
  const response = await http.put(`/invoice/delegations/${id}/`, data);
  return response.data;
};

const deleteDelegation = async (id) => {
  const response = await http.delete(`/invoice/delegations/${id}/`);
  return response.data;
};

const delegationService = {
  getAllDelegations,
  createDelegation,
  updateDelegation,
  deleteDelegation,
};

export default delegationService;