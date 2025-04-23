import http from '../../http-common';

const getAllSection = async (data) => {
  const token = localStorage.getItem('token');
  // Optionally, remove any filters that are empty (this step is optional)
  const filterEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== '' && v != null)
    );

  const filteredData = filterEmpty(data);

  // Use URLSearchParams to convert the data object into a query string
  const queryParams = new URLSearchParams(filteredData).toString();

  const response = await http.get(`/invoice/section-list/?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
 

  return response.data;
};

const getAllSectionsWithNoPagination = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/invoice/new-section-list/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllSectionByDepartmentId = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.get(
    `/invoice/sections_in_department/?department_id=${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const addSection = async (data) => {
  const token = localStorage.getItem('token');
  const response = await http.post('/invoice/create-section/', data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateSection = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await http.put(`/invoice/update-section/${id}/`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const deleteSection = async (id) => {
  const token = localStorage.getItem('token');
  const response = await http.delete(`/invoice/delete-section/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getSectionFromErp = async () => {
  const token = localStorage.getItem('token');
  const response = await http.get('/invoice/sections/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
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
