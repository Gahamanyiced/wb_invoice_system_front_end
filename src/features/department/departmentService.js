import http from '../../http-common';

const getAllDepartment = async (data) => {
  const token = localStorage.getItem('token');
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/department-list/?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const getDepartmentByErp = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/invoice/departments/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const addDepartment = async (data) => {
  const token = localStorage.getItem('token');
  const response = await http.post('/invoice/create-department/', data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateDepartment = async (id, data) => {
  const token = localStorage.getItem('token');

  const response = await http.put(`/invoice/update-department/${id}/`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getDepartmentById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get(`/invoice/department-detail/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const deleteDepartment = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.delete(`/invoice/delete-department/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const checkHeadDepartment = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/auth/is_head_of_department/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const departmentService = {
  getAllDepartment,
  getDepartmentByErp,
  addDepartment,
  updateDepartment,
  getDepartmentById,
  deleteDepartment,
  checkHeadDepartment,
};

export default departmentService;
