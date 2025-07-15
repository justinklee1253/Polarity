import { apiService } from "./api";

export async function updateOnboardingStep(step, data) {
  const token = localStorage.getItem("access_token");
  return apiService.request(`/onboarding/step/${step}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function completeOnboarding() {
  const token = localStorage.getItem("access_token");
  return apiService.request("/onboarding/complete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getOnboardingStatus() {
  const token = localStorage.getItem("access_token");
  return apiService.request("/onboarding/status", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function checkOnboardingCompletion() {
  const token = localStorage.getItem("access_token");
  return apiService.request("/onboarding/check_completion", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
