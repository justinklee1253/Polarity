const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  constructor() {
    this.isRefreshing = false; //flag for preventing multiple refresh attempts.
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`; // this is the URL we are going to be making a call to.

    const config = {
      //specifying that for all requests made to backend, must be in JSON format, and then additional headers depending on route.
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", //send cookies with request --> for refresh tokenb
      ...options,
    };

    try {
      const response = await fetch(url, config); //waiting for the fetch to return a promise
      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn("Response is not valid JSON: ", jsonError);
        data = {};
      }

      if (
        response.status === 401 &&
        endpoint !== "/auth/refresh" &&
        endpoint !== "/auth/login" &&
        !this.isRefreshing
      ) {
        //if token expired --> refresh
        this.isRefreshing = true;
        try {
          console.log("Attempting token refresh");
          const refreshResult = await this.refreshToken();

          if (refreshResult.data.access_token) {
            localStorage.setItem(
              "access_token",
              refreshResult.data.access_token
            );

            config.headers.Authorization = `Bearer ${refreshResult.data.access_token}`;
            const retryResponse = await fetch(url, config);
            const retryData = await retryResponse.json();

            this.isRefreshing = false;
            return { data: retryData, response: retryResponse };
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          this.clearAuth();
          window.location.href = `/login`;
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

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
    try {
      const { data, response } = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      // Store onboarding step for resuming
      if (!data.onboarding_completed) {
        localStorage.setItem("onboarding_step", data.onboarding_step || "0");
        window.location.href = "/onboarding";
      } else {
        window.location.href = "/dashboard";
      }
      return { data, response };
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  }

  async logout() {
    const token = localStorage.getItem("access_token");
    const result = await this.request("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, //when logging out, we get access token from LS, then send a request to logout route
      },
    });

    //if successful
    localStorage.removeItem("access_token");
    return result;
  }

  async getCurrentUser() {
    const token = localStorage.getItem("access_token"); //getting the access JWT token from browser's localstorage
    // console.log("Token:", token); DEBUG TO SHOW JWT TOKEN
    if (!token) {
      throw new Error("No access token found");
    }
    return this.request("/auth/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async refreshToken() {
    if (this.isRefreshing) {
      throw new Error("Refresh already in progress");
    }

    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  async updateOnboardingStep(step, data) {
    const token = localStorage.getItem("access_token");
    return this.request(`/onboarding/step/${step}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding() {
    const token = localStorage.getItem("access_token");
    return this.request("/onboarding/complete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async getOnboardingStatus() {
    const token = localStorage.getItem("access_token");
    return this.request("/onboarding/status", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  isAuthenticated() {
    const token = localStorage.getItem("access_token");
    return !!token;
  }

  clearAuth() {
    localStorage.removeItem("access_token");
  }

  getToken() {
    return localStorage.getItem("access_token");
  }
}

export const apiService = new ApiService();
