import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("orka_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("orka_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, org_name: string) =>
    api.post('/auth/register', { name, email, password, org_name }),
}

export const integAPI = {
  list:       (org_id: string) => api.get(`/integrations/?org_id=${org_id}`),
  connectUrl: (platform: string) => api.get(`/integrations/connect/${platform}`),
  disconnect: (id: string) => api.delete(`/integrations/${id}`),
}
