import http from '../../http-common';

const getAllSigners = async (id) => {
  const response = await http.get('/auth/signer-list/');
  return response.data;
};

const getNextSigners = async (id) => {
  const response = await http.get(`/auth/next-signer-list/${id}/`);
  return response.data;
};

const getCeoSigner = async () => {
  const response = await http.get('/auth/ceo-signer-list/');
  return response.data;
};

const getDceoSigner = async () => {
  const response = await http.get('/auth/dceo-signer-list/');
  return response.data;
};

const getDepartmentNextSigners = async (data) => {
  const response = await http.get(
    `/user/signers_exclude_department/?department_name=${data}`
  );

  return response.data;
};

const getAllUsers = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/auth/user-list/?${queryParams}`);
  console.log('response.data', response.data);

  return response.data;
};

const getAllUsersWithNoPagination = async () => {
  const response = await http.get('/auth/all-users/');
  return response.data;
};

const updateUser = async (id, data) => {
  const response = await http.put(`/auth/user-role-update/${id}/`, data);
  return response.data;
};

const updateSupplier = async (data) => {
  const response = await http.patch(`/auth/supplier_profile_update/`, data);
  return response.data;
};

const userService = {
  getAllSigners,
  getNextSigners,
  getDepartmentNextSigners,
  getAllUsers,
  getAllUsersWithNoPagination,
  getCeoSigner,
  getDceoSigner,
  updateUser,
  updateSupplier,
};

export default userService;
