//Frontend Service Layer for our chat

import Auth from "@/pages/Auth";
import { apiService } from "./api";

export async function create_conversation(title) {
  //since route is jwt_required, need to define access token

  const token = localStorage.getItem("access_token");
  const body = title ? { title } : {};
  return apiService.request("/chat/conversations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function get_conversations() {
  const token = localStorage.getItem("access_token");
  return apiService.request("/chat/conversations", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
