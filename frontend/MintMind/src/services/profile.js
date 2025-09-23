import { apiService } from "./api";

/**
 * Get complete profile data for editing
 */
export async function getProfileData() {
  return apiService.request("/profile/data", {
    method: "GET",
  });
}

/**
 * Update user email address
 */
export async function updateEmail(emailData) {
  return apiService.request("/profile/update-email", {
    method: "PUT",
    body: JSON.stringify(emailData),
  });
}

/**
 * Update user password
 */
export async function updatePassword(passwordData) {
  return apiService.request("/profile/update-password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
}

/**
 * Update financial information and goals
 */
export async function updateFinancialInfo(financialData) {
  return apiService.request("/profile/update-financial", {
    method: "PUT",
    body: JSON.stringify(financialData),
  });
}


