const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(localStorage.getItem("greenchain:auth"));
    return stored?.token || null;
  } catch {
    return null;
  }
}

function getAuthHeader(contentType = "application/json") {
  const token = getAuthToken();
  return {
    ...(contentType && { "Content-Type": contentType }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || "API request failed");
  }
  if (response.status === 204) return null;
  return response.json();
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function resolveUrl(path) {
  if (!API_URL) return path;
  return `${API_URL}${path}`;
}

async function callApi(path, options = {}) {
  const url = resolveUrl(path);
  try {
    const finalOptions = {
      ...options,
      cache: 'no-store', // Prevent caching
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    const response = await fetch(url, finalOptions);
    return handleResponse(response);
  } catch (error) {
    if (error?.name === "TypeError") {
      throw new Error(
        `Unable to reach the GreenChain API at ${API_URL || "the current origin"
        }. Make sure the backend server is running and NEXT_PUBLIC_API_URL is set.`,
      );
    }
    throw error;
  }
}

const api = {
  auth: {
    register: async (email, password, name, role, phone, address, latitude, longitude) => {
      return callApi("/api/auth/register", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ email, password, name, role, phone, address, latitude, longitude }),
      });
    },

    login: async (email, password) => {
      return callApi("/api/auth/login", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ email, password }),
      });
    },

    forgotPassword: async (email) => {
      return callApi("/api/auth/forgot-password", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ email }),
      });
    },

    resetPassword: async (token, newPassword) => {
      return callApi("/api/auth/reset-password", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ token, newPassword }),
      });
    },

    deleteAccount: async () => {
      return callApi("/api/auth/delete-account", {
        method: "DELETE",
        headers: getAuthHeader(),
      });
    },
  },

  donations: {
    list: async (params = {}) => {
      return callApi(`/api/donations${buildQuery(params)}`, {
        headers: getAuthHeader(),
      });
    },

    listMine: async () => {
      return callApi("/api/donations/mine", {
        headers: getAuthHeader(),
      });
    },

    listAvailable: async (params = {}) => {
      // Ensure limit is set if not provided, but allow overriding
      const queryParams = { limit: 50, ...params };
      return callApi(`/api/donations/available${buildQuery(queryParams)}`, {
        headers: getAuthHeader(),
      });
    },

    stats: async () => {
      return callApi("/api/donations/stats/overview", {
        headers: getAuthHeader(),
      });
    },

    get: async (id) => {
      return callApi(`/api/donations/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: async (formData) => {
      const headers = { ...getAuthHeader(null) };
      return callApi("/api/donations", {
        method: "POST",
        headers,
        body: formData,
      });
    },

    update: async (id, formData) => {
      const headers = { ...getAuthHeader(null) };
      return callApi(`/api/donations/${id}`, {
        method: "PATCH",
        headers,
        body: formData,
      });
    },

    remove: async (id) => {
      return callApi(`/api/donations/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
    },

    claim: async (id) => {
      return callApi(`/api/donations/${id}/claim`, {
        method: "POST",
        headers: getAuthHeader(),
      });
    },

    confirmPickup: async (id, confirmed) => {
      return callApi(`/api/donations/${id}/confirm-pickup`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ confirmed }),
      });
    },
  },

  claims: {
    mine: async () => {
      return callApi("/api/claims/mine", {
        headers: getAuthHeader(),
      });
    },

    updateStatus: async (id, status) => {
      return callApi(`/api/claims/${id}`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });
    },
  },

  verify: {
    get: async (eventId) => {
      return callApi(`/api/verify/${eventId}`, {
        headers: getAuthHeader(),
      });
    },

    verify: async (eventId, dataHash, notes = "") => {
      return callApi(`/api/verify/${eventId}/verify`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ dataHash, notes }),
      });
    },
  },

  users: {
    getProfile: async () => {
      return callApi("/api/users/me", {
        headers: getAuthHeader(),
      });
    },

    updateProfile: async (updates) => {
      return callApi("/api/users/me", {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify(updates),
      });
    },

    updateLocation: async (lat, lng, location_label) => {
      return callApi("/api/users/me/location", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ lat, lng, location_label })
      });
    }
  },

  ai: {
    getSpoilageSuggestion: async (params) => {
      return callApi("/api/ai/spoilage-suggestion", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(params),
      });
    },
  },
};

export default api;
