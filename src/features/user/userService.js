import http from '../../http-common';

const getAllSigners = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get('/auth/signer-list/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getNextSigners = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get(`/auth/next-signer-list/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getCeoSigner = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/auth/ceo-signer-list/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getDceoSigner = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/auth/dceo-signer-list/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getDepartmentNextSigners = async (data) => {
  const token = localStorage.getItem('token');
  const response = await http.get(
    `/user/signers_exclude_department/?department_name=${data}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const getAllUsers = async (data) => {
  const token = localStorage.getItem('token');
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/auth/user-list/?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('response.data', response.data);

  return response.data;
};

const getAllUsersWithNoPagination = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/auth/all-users/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateUser = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.put(`/auth/user-role-update/${id}/`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateSupplier = async (data) => {
  const token = localStorage.getItem('token');
  const response = await http.patch(`/auth/supplier_profile_update/`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
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
