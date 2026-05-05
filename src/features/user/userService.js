import http from '../../http-common';

const getAllSigners = async (data = {}) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );

  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();

  const url = queryParams
    ? `/auth/signer-list-no-pagination/?${queryParams}`
    : '/auth/signer-list-no-pagination/';

  const response = await http.get(url);
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
    `/user/signers_exclude_department/?department_name=${data}`,
  );
  return response.data;
};

const getAllUsers = async (data) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );

  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/auth/user-list/?${queryParams}`);
  return response.data;
};

// Always calls /auth/all-users/ — accepts optional filter params
// e.g. { is_approved: true, role: 'signer_admin', is_invoice_verifier: true }
const getAllUsersWithNoPagination = async (data = {}) => {
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null),
    );

  const filteredData = filterEmpty(data);
  const queryParams = new URLSearchParams(filteredData).toString();

  const url = queryParams
    ? `/auth/all-users/?${queryParams}`
    : '/auth/all-users/';

  const response = await http.get(url);
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
