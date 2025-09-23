const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const waitlistService = {
  // Add email to waitlist
  async signup(email) {
    const response = await fetch(`${API_BASE_URL}/waitlist/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to join waitlist");
    }

    return data;
  },

  // Create Stripe checkout session for lifetime plan
  async createCheckoutSession(email) {
    const response = await fetch(
      `${API_BASE_URL}/waitlist/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session");
    }

    return data;
  },

  // Create Stripe checkout session for monthly plan
  async createMonthlyCheckoutSession(email) {
    const response = await fetch(
      `${API_BASE_URL}/waitlist/create-monthly-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to create monthly checkout session"
      );
    }

    return data;
  },

  // Check payment status
  async checkStatus(email) {
    const response = await fetch(
      `${API_BASE_URL}/waitlist/check-status/${encodeURIComponent(email)}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to check status");
    }

    return data;
  },

  // Handle successful payment (called from success page)
  async confirmPayment(sessionId) {
    const response = await fetch(`${API_BASE_URL}/waitlist/confirm-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to confirm payment");
    }

    return data;
  },
};

export default waitlistService;
