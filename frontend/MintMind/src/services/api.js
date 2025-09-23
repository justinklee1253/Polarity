const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  constructor() {
    this.isRefreshing = false; //flag for tracking whether token refresh is in progress.
    //prevent multiple simultaneous refresh token requests
    //if many api calls are made at once, and all fail due to expired token it is wasteful--> without flag each one attempts its own /auth/refresh call
    //ensures only 1 request sent at time, and other calls wait for this to complete
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
        response.status === 401 && //if unauthorized(expired token), and not already refreshing
        endpoint !== "/auth/refresh" &&
        endpoint !== "/auth/login" && //if not logging in, since no point in refresh token if user will re-login for new token
        !this.isRefreshing //not currently refreshing
      ) {
        //if token expired --> marks that refresh in progress
        this.isRefreshing = true;
        try {
          // console.log("Attempting token refresh");
          const refreshResult = await this.refreshToken(); //tries to refresh token

          if (refreshResult.data.access_token) {
            localStorage.setItem(
              "access_token",
              refreshResult.data.access_token
            );

            config.headers.Authorization = `Bearer ${refreshResult.data.access_token}`;
            const retryResponse = await fetch(url, config); //retry original request
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
      // console.log(`API request failed: `, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
