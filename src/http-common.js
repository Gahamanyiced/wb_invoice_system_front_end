import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

const requestHandler = (request) => {
  // request.headers.Authorization = `Bearer ${localStorage.token}`;
  return request;
};

const responseHandler = (response) => {
  if (response.status === 401) {
    // localStorage.removeItem("token");
    window.location.href = '/';
  }
  return response;
};

const errorHandler = (error) => {
  if (error.response.status === 401) {
    // localStorage.removeItem("token");
    window.location.href = '/';
  }
  return Promise.reject(error);
};

http.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => errorHandler(error)
);

http.interceptors.response.use(
  (response) => responseHandler(response),
  (error) => errorHandler(error)
);

export default http;
