import axios from 'axios';

// Helper function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to set cookie
const setCookie = (name, value, hours = 24) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

// Helper function to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

const http = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true, // Important: This allows cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

const requestHandler = (request) => {
  // Get access token from cookies
  const accessToken = getCookie('access_token');
  
  if (accessToken) {
    // Add Authorization header with Bearer token
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return request;
};

const responseHandler = (response) => {
  if (response.status === 401) {
    // Clear cookies and redirect
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    window.location.href = '/';
  }
  return response;
};

const errorHandler = async (error) => {
  const originalRequest = error.config;

  // Handle 401 (Unauthorized) errors with token refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // Get refresh token from cookies
      const refreshToken = getCookie('refresh_token');

      if (refreshToken) {
        // Attempt to refresh the access token
        const refreshResponse = await axios.post(
          `${process.env.REACT_APP_BASE_URL}auth/token/refresh/`,
          {
            refresh: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        // If refresh is successful, the new tokens should be set in cookies by the server
        // If your server doesn't set cookies automatically, uncomment and modify the lines below:
        // const { access_token, refresh_token } = refreshResponse.data;
        // setCookie('access_token', access_token, 24);
        // if (refresh_token) setCookie('refresh_token', refresh_token, 24);

        // Retry the original request with new token
        const newAccessToken = getCookie('access_token');
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return http(originalRequest);
        }
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      
      // Clear invalid tokens and redirect
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      window.location.href = '/';
      
      return Promise.reject(refreshError);
    }
  }

  // For other 401 errors or if refresh fails, clear cookies and redirect
  if (error.response?.status === 401) {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
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

// Export helper functions for managing cookies
export { getCookie, setCookie, deleteCookie };

export default http;