import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, userData, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data;
};

export const getDashboardStats = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/policies/dashboard`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data;
};

export const addPolicy = async (policyData, documents, token) => {
  const formData = new FormData();

  // Append all form fields to the FormData object
  for (const key in policyData) {
    if (Object.hasOwnProperty.call(policyData, key)) {
      formData.append(key, policyData[key]);
    }
  }

  // Append each selected file to the FormData object
  if (documents && documents.length > 0) {
    for (let i = 0; i < documents.length; i++) {
      formData.append('documents', documents[i]);
    }
  }

  // The 'Content-Type': 'multipart/form-data' header is automatically set by axios
  // when a FormData object is provided, so we only need to specify Authorization.
  const response = await axios.post(`${API_BASE_URL}/policies`, formData, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });

  return response.data;
};

export const getAllPolicies = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/policies`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data;
};

export const getPolicyById = async (policyId, token) => {
  const response = await axios.get(`${API_BASE_URL}/policies/${policyId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data;
};

