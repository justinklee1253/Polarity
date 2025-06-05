const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API_BASE_URL:", API_BASE_URL); // Debug log

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`; // this is the URL we are going to be making a call to.
    console.log(`Making request to: `, url); //DEBUG

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config); //waiting for the fetch to return a promise
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { data, response };
    } catch (error) {
      console.log(`API request failed: `, error);
      throw error;
    }
  }
  async signup(userData) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    // You'll need to handle JWT token here
    return this.request("/auth/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  }
}

export const apiService = new ApiService();
