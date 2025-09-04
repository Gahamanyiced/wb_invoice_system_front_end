import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true, // This automatically sends HTTP-only cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

const responseHandler = (response) => {
  if (response.status === 401) {
    // Clear user data and redirect on unauthorized
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return response;
};

const errorHandler = async (error) => {
  const originalRequest = error.config;

  // Handle 401 (Unauthorized) errors with token refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // Attempt to refresh the access token
      // The refresh token is automatically sent as HTTP-only cookie
      const refreshResponse = await axios.post(
        `${process.env.REACT_APP_BASE_URL}auth/token/refresh/`,
        {}, // Empty body - refresh token is sent automatically as HTTP-only cookie
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // If refresh is successful, new tokens are set as HTTP-only cookies by server
      if (refreshResponse.status === 200) {
        // Retry the original request
        return http(originalRequest);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);

      // Clear user data and redirect
      localStorage.removeItem('user');
      window.location.href = '/login';

      return Promise.reject(refreshError);
    }
  }

  // For other 401 errors, clear user data and redirect
  if (error.response?.status === 401) {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return Promise.reject(error);
};

// Only response interceptor needed - no request interceptor since cookies are sent automatically
http.interceptors.response.use(
  (response) => responseHandler(response),
  (error) => errorHandler(error)
);

export default http;
