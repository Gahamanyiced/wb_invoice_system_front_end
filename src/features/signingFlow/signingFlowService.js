import http from '../../http-common';

const getAllSigningFlow = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/all_levels/?${queryParams}`);

  return response.data;
};

const getAllSigningFlowByDepartment = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(
    `/invoice/department_signing_levels/?${queryParams}`
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

const signingFlowService = {
  getAllSigningFlow,
  getAllSigningFlowByDepartment,
  addSigningFlow,
  editSigningFlow,
};

export default signingFlowService;
