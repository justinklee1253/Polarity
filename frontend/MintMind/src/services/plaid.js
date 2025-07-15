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

export async function updateUserBalance(accessToken) {
  const token = localStorage.getItem("access_token");
  return apiService.request("/plaid/update_balance", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_token: accessToken }),
  });
}

export async function exchangePublicToken(publicToken) {
  const token = localStorage.getItem("access_token");
  return apiService.request("/plaid/exchange_public_token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_token: publicToken }),
  });
}
