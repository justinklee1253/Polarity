import { apiService } from "./api";

export async function signup(userData) {
  return apiService.request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function login(credentials) {
  try {
    const { data, response } = await apiService.request("/auth/login", {
      //use await to wait for promise to resolve before continuing.
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data.access_token) {
      //if access token is returned, set it in local storage.
      localStorage.setItem("access_token", data.access_token);
    }
    if (!data.onboarding_completed) {
      //if onboarding is not completed, set the onboarding step in local storage and redirect to onboarding page.
      localStorage.setItem("onboarding_step", data.onboarding_step || "0");
      window.location.href = "/onboarding";
    } else {
      //if onboarding is completed, redirect to dashboard page.
      window.location.href = "/dashboard";
    }
    return { data, response };
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function logout() {
  const token = localStorage.getItem("access_token");
  const result = await apiService.request("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  localStorage.removeItem("access_token");
  return result;
}

export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  return apiService.request("/auth/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function refreshToken() {
  if (apiService.isRefreshing) {
    throw new Error("Refresh already in progress");
  }
  return apiService.request("/auth/refresh", {
    method: "POST",
  });
}

export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  return !!token;
}

export function clearAuth() {
  localStorage.removeItem("access_token");
}

export function getToken() {
  return localStorage.getItem("access_token");
}
