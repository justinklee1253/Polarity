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

export async function get_specific_conversation(id) {
  const token = localStorage.getItem("access_token");
  return apiService.request(`/chat/conversations/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function get_conversation_messages(id) {
  const token = localStorage.getItem("access_token");
  return apiService.request(`/chat/conversations/${id}/messages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function delete_conversation(id) {
  const token = localStorage.getItem("access_token");
  return apiService.request(`/chat/conversations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function send_user_message(conversationId, message) {
  const token = localStorage.getItem("access_token");
  return apiService.request(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
}
