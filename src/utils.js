export function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    error?.error ||
    error?.toString() ||
    'An error occurred'
  );
}
