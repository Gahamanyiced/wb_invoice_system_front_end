import http from '../../http-common';

const getAllSection = async (data) => {
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/section-list/?${queryParams}`);

  return response.data;
};

const getAllSectionsWithNoPagination = async () => {
  const response = await http.get('/invoice/new-section-list/');
  return response.data;
};

const getAllSectionByDepartmentId = async (id) => {
  const response = await http.get(
    `/invoice/sections_in_department/?department_id=${id}`
  );

  return response.data;
};

const addSection = async (data) => {
  const response = await http.post('/invoice/create-section/', data);
  return response.data;
};

const updateSection = async (id, data) => {
  const response = await http.put(`/invoice/update-section/${id}/`, data);
  return response.data;
};

const deleteSection = async (id) => {
  const response = await http.delete(`/invoice/delete-section/${id}/`);
  return response.data;
};

const getSectionFromErp = async () => {
  const response = await http.get('/invoice/sections/');
  return response.data;
};

const sectionService = {
  getAllSection,
  getAllSectionsWithNoPagination,
  addSection,
  updateSection,
  deleteSection,
  getSectionFromErp,
  getAllSectionByDepartmentId,
};

export default sectionService;
