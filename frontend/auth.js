export const API_URL = "https://expensetracker-qvfw.onrender.com/api";
export const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};
