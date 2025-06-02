import http from '../../http-common';

const getAllDepartment = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/department-list/?${queryParams}`);

  return response.data;
};

const getDepartmentByErp = async () => {
  const response = await http.get('/invoice/departments/');

  return response.data;
};

const addDepartment = async (data) => {
  const response = await http.post('/invoice/create-department/', data);
  return response.data;
};

const updateDepartment = async (id, data) => {
  const response = await http.put(`/invoice/update-department/${id}/`, data);
  return response.data;
};

const getDepartmentById = async (id) => {
  const response = await http.get(`/invoice/department-detail/${id}`);
  return response.data;
};

const deleteDepartment = async (id) => {
  const response = await http.delete(`/invoice/delete-department/${id}/`);
  return response.data;
};

const checkHeadDepartment = async () => {
  const response = await http.get('/auth/is_head_of_department/');
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