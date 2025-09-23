import { apiService } from "./api";

/**
 * Transaction Service
 * Handles all transaction-related API calls to the backend
 */

/**
 * Fetch user's transactions with optional filtering, pagination, and sorting
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Transactions per page (default: 50, max: 100)
 * @param {string} params.sort_by - Sort field: 'date', 'amount', 'name', 'type', 'category' (default: 'date')
 * @param {string} params.sort_order - 'asc' or 'desc' (default: 'desc')
 * @param {string} params.type - Filter by transaction type: 'income', 'expense'
 * @param {string} params.category - Filter by user_category
 * @param {string} params.search - Search in transaction name
 * @param {string} params.start_date - Filter from date (YYYY-MM-DD)
 * @param {string} params.end_date - Filter to date (YYYY-MM-DD)
 * @returns {Promise<Object>} Response with transactions array and pagination metadata
 */

export async function getTransactions(params = {}) {
  const token = localStorage.getItem("access_token");

  // Build query string from parameters
  const searchParams = new URLSearchParams();

  // Add each parameter if it exists and is not empty
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

  return apiService.request(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get calculated monthly income based on actual income transactions
 * @returns {Promise<Object>} Response with monthly income calculation
 */
export async function getMonthlyIncome() {
  const token = localStorage.getItem("access_token");

  return apiService.request("/transactions/monthly-income", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get all unique categories used by the user's transactions
 * @returns {Promise<Object>} Response with categories array and count
 */
export async function getTransactionCategories() {
  const token = localStorage.getItem("access_token");

  return apiService.request("/transactions/categories", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get summary statistics for user's transactions
 * @returns {Promise<Object>} Response with transaction summary data
 */
export async function getTransactionSummary() {
  const token = localStorage.getItem("access_token");

  return apiService.request("/transactions/summary", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update a transaction's category, notes, or other editable fields
 * @param {number} transactionId - The transaction ID to update
 * @param {Object} updates - Fields to update
 * @param {string} updates.user_category - User-defined category
 * @param {string} updates.notes - Transaction notes
 * @param {boolean} updates.is_recurring - Whether transaction is recurring
 * @returns {Promise<Object>} Response with updated transaction data
 */
export async function updateTransaction(transactionId, updates) {
  const token = localStorage.getItem("access_token");

  return apiService.request(`/transactions/${transactionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
}

/**
 * Sync latest transactions from Plaid (manual refresh)
 * @returns {Promise<Object>} Response with sync status
 */
export async function syncTransactions() {
  const token = localStorage.getItem("access_token");

  return apiService.request("/transactions/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Helper function to build transaction query parameters
 * Useful for components that need to construct complex queries
 * @param {Object} filters - Filter object
 * @returns {Object} Formatted query parameters
 */
export function buildTransactionQuery(filters = {}) {
  const query = {};

  // Pagination
  if (filters.page) query.page = filters.page;
  if (filters.perPage) query.per_page = filters.perPage;

  // Sorting
  if (filters.sortBy) query.sort_by = filters.sortBy;
  if (filters.sortOrder) query.sort_order = filters.sortOrder;

  // Filters
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.search) query.search = filters.search;
  if (filters.startDate) query.start_date = filters.startDate;
  if (filters.endDate) query.end_date = filters.endDate;

  return query;
}

/**
 * Get transactions for a specific date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with filtered transactions
 */
export async function getTransactionsByDateRange(
  startDate,
  endDate,
  additionalParams = {}
) {
  return getTransactions({
    start_date: startDate,
    end_date: endDate,
    ...additionalParams,
  });
}

/**
 * Get transactions by category
 * @param {string} category - Category name
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with filtered transactions
 */
export async function getTransactionsByCategory(
  category,
  additionalParams = {}
) {
  return getTransactions({
    category: category,
    ...additionalParams,
  });
}

/**
 * Get transactions by type (income/expense)
 * @param {string} type - Transaction type ('income' or 'expense')
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with filtered transactions
 */
export async function getTransactionsByType(type, additionalParams = {}) {
  return getTransactions({
    type: type,
    ...additionalParams,
  });
}

/**
 * Search transactions by name/description
 * @param {string} searchTerm - Search term
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with matching transactions
 */
export async function searchTransactions(searchTerm, additionalParams = {}) {
  return getTransactions({
    search: searchTerm,
    ...additionalParams,
  });
}

/**
 * Get recent transactions (last 30 days)
 * @param {number} limit - Number of transactions to fetch (default: 20)
 * @returns {Promise<Object>} Response with recent transactions
 */
export async function getRecentTransactions(limit = 20) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return getTransactions({
    start_date: thirtyDaysAgo.toISOString().split("T")[0],
    per_page: limit,
    sort_by: "date",
    sort_order: "desc",
  });
}

/**
 * Get transactions for current month
 * @returns {Promise<Object>} Response with current month transactions
 */
export async function getCurrentMonthTransactions() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return getTransactions({
    start_date: firstDayOfMonth.toISOString().split("T")[0],
    end_date: now.toISOString().split("T")[0],
    sort_by: "date",
    sort_order: "desc",
  });
}

// Export all functions as named exports for easier importing
export default {
  getTransactions,
  getTransactionCategories,
  getTransactionSummary,
  updateTransaction,
  syncTransactions,
  buildTransactionQuery,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  getTransactionsByType,
  searchTransactions,
  getRecentTransactions,
  getCurrentMonthTransactions,
};
