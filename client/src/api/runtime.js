export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "https://mediconnect-2imn.onrender.com").replace(/\/+$/, "");

export const toBackendUrl = (path = "") => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
