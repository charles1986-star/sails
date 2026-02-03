import axios from "axios";

const CURRENT_USER_KEY = "sails_current_user";
const TOKEN_KEY = "sails_auth_token";
const API_URL = "http://localhost:5000/api";

export async function signupUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return { success: true, message: response.data.msg, type: response.data.type };
  } catch (error) {
    const message = error.response?.data?.msg || "Signup failed";
    return { success: false, message, type: "error" };
  }
}

export async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    return { 
      success: true, 
      message: response.data.msg, 
      type: response.data.type,
      user 
    };
  } catch (error) {
    const message = error.response?.data?.msg || "Login failed";
    return { success: false, message, type: "error" };
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const s = localStorage.getItem(CURRENT_USER_KEY);
  return s ? JSON.parse(s) : null;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function getAuthHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default { signupUser, loginUser, logoutUser, getCurrentUser, getAuthToken, isAuthenticated, getAuthHeader };
