import { apiService } from "./api";

export async function createPlaidLinkToken() {
  const token = localStorage.getItem("access_token");
  return apiService.request("/plaid/create_link_token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
