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
    const response = await fetch(url, options);
    return handleResponse(response);
  } catch (error) {
    if (error?.name === "TypeError") {
      throw new Error(
        `Unable to reach the GreenChain API at ${
          API_URL || "the current origin"
        }. Make sure the backend server is running and NEXT_PUBLIC_API_URL is set.`,
      );
    }
    throw error;
  }
}

const api = {
  auth: {
    register: async (email, password, name, role) => {
      return callApi("/api/auth/register", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ email, password, name, role }),
      });
    },

    login: async (email, password) => {
      return callApi("/api/auth/login", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ email, password }),
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

    listAvailable: async (limit = 50) => {
      return callApi(`/api/donations/available?limit=${limit}`, {
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
};

export default api;
