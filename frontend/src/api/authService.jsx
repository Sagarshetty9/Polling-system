import apiClient from "./apiClient";

export const registerUser = async (userData) => {
  try {
    const { data } = await apiClient.post('/auth/register', userData);
    
    // Store token if it exists
    if (data.token) localStorage.setItem('token', data.token);
    
    return data;
  } catch (error) {
    // Dig out the specific message string from the backend response
    const errorMessage = error.response?.data?.message || "Network Error";
    
    // Throwing just the string makes it much easier for the toast to display
    throw new Error(errorMessage); 
  }
};