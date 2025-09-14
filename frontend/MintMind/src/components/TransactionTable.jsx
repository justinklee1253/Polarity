import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getTransactions,
  getTransactionCategories,
  updateTransaction,
  syncTransactions,
} from "@/services/transactions";

const TransactionTable = ({ currentBalance = 0, onTransactionsUpdate }) => {
  // State for transactions data
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [perPage] = useState(10);

  // State for available categories from backend
  const [availableCategories, setAvailableCategories] = useState([]);

  // State for auto-refresh
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    paymentType: "",
    name: "",
    category: "",
    amount: "",
    isRecurring: false,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Default categories (fallback if backend categories not loaded)
  const defaultCategories = [
    "Food",
    "Entertainment",
    "Travel",
    "Rent",
    "Education",
    "Healthcare",
    "Transportation",
    "Shopping",
    "Bills",
    "Income",
    "Other",
  ];

  // Use backend categories if available, otherwise use defaults
  const categories =
    availableCategories.length > 0 ? availableCategories : defaultCategories;

  // Function to generate consistent colors for categories
  const getCategoryColor = (category) => {
    const colors = {
      Food: "bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30 shadow-orange-500/25",
      Entertainment:
        "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 shadow-purple-500/25",
      Travel:
        "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 shadow-indigo-500/25",
      Rent: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30 shadow-yellow-500/25",
      Education:
        "bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30 shadow-pink-500/25",
      Healthcare:
        "bg-teal-500/20 text-teal-300 border-teal-500/30 hover:bg-teal-500/30 shadow-teal-500/25",
      Transportation:
        "bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30 shadow-violet-500/25",
      Shopping:
        "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 hover:bg-fuchsia-500/30 shadow-fuchsia-500/25",
      Bills:
        "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 shadow-amber-500/25",
      Income:
        "bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30 shadow-slate-500/25",
    };

    // Default fallback color for unknown categories
    return (
      colors[category] ||
      "bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30 shadow-gray-500/25"
    );
  };

  const paymentTypes = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Digital Wallet",
  ];

  // Fetch transactions from backend
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: "date",
        sort_order: "desc",
      };

      // Add filters if they exist
      if (searchTerm) params.search = searchTerm;
      if (filterCategory && filterCategory !== "all")
        params.category = filterCategory;

      const { data } = await getTransactions(params);

      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalTransactions(data.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, filterCategory]);

  // Fetch available categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await getTransactionCategories();
      setAvailableCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Use default categories if backend fails
    }
  }, []);

  // Sync transactions with Plaid
  const handleSyncTransactions = async () => {
    try {
      setSyncing(true);
      await syncTransactions();
      // Refresh transactions after sync
      await fetchTransactions();
    } catch (err) {
      console.error("Error syncing transactions:", err);
      setError("Failed to sync transactions");
    } finally {
      setSyncing(false);
    }
  };

  // Calculate running balances and monthly spent
  const calculateBalances = (transactionList) => {
    let runningBalance = currentBalance;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let monthlySpent = 0;

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactionList].sort(
      (a, b) =>
        new Date(b.date_posted || b.date) - new Date(a.date_posted || a.date)
    );

    const transactionsWithBalance = sortedTransactions.map((transaction) => {
      const transactionDate = new Date(
        transaction.date_posted || transaction.date
      );
      const amount = parseFloat(transaction.amount) || 0;

      // Calculate monthly spending for current month expenses
      if (
        transaction.type === "expense" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      ) {
        monthlySpent += amount;
      }

      const transactionWithBalance = {
        ...transaction,
        amount: amount,
        balance: runningBalance,
      };

      // Update running balance for next transaction
      if (transaction.type === "expense") {
        runningBalance += amount; // Add back the expense (since we're going backwards in time)
      } else {
        runningBalance -= amount; // Subtract the income (since we're going backwards in time)
      }

      return transactionWithBalance;
    });

    // Reverse to show newest first but with correct running balance
    return { transactions: transactionsWithBalance, monthlySpent };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  // Auto-refresh for new users (first 30 seconds after mount)
  useEffect(() => {
    let refreshInterval;
    let refreshCount = 0;
    const maxRefreshes = 6; // Refresh 6 times over 30 seconds

    // Only auto-refresh if we have no transactions initially
    if (transactions.length === 0) {
      setAutoRefreshing(true);
      refreshInterval = setInterval(() => {
        refreshCount++;
        console.log(
          `Auto-refreshing transactions (${refreshCount}/${maxRefreshes})`
        );
        fetchTransactions();

        // Stop auto-refreshing after max attempts or if transactions are found
        if (refreshCount >= maxRefreshes) {
          clearInterval(refreshInterval);
          setAutoRefreshing(false);
        }
      }, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []); // Only run once on mount

  // Stop auto-refresh when transactions are found
  useEffect(() => {
    if (transactions.length > 0 && autoRefreshing) {
      // Transactions found, no need to continue auto-refreshing
      console.log(
        `Found ${transactions.length} transactions, stopping auto-refresh`
      );
      setAutoRefreshing(false);
    }
  }, [transactions.length, autoRefreshing]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchTransactions();
      } else {
        setCurrentPage(1); // Reset to first page, will trigger fetchTransactions
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCategory]);

  // Fetch when page changes
  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  // Recalculate balances whenever transactions change
  useEffect(() => {
    const { monthlySpent } = calculateBalances(transactions);
    if (onTransactionsUpdate) {
      onTransactionsUpdate(monthlySpent);
    }
  }, [transactions, currentBalance, onTransactionsUpdate]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === "INPUT") return; // Don't interfere with input fields

      if (event.key === "ArrowLeft" && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else if (event.key === "ArrowRight" && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return;

    const transaction = {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount),
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      paymentType: "",
      name: "",
      category: "",
      amount: "",
      isRecurring: false,
    });
    setShowAddForm(false);
  };

  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    setEditingTransaction({ ...transaction });
  };

  const saveEdit = async () => {
    try {
      const updates = {
        user_category:
          editingTransaction.user_category || editingTransaction.category,
        notes: editingTransaction.notes,
        // Note: is_recurring is no longer editable for Plaid transactions
      };

      await updateTransaction(editingId, updates);

      // Update local state
      setTransactions(
        transactions.map((t) =>
          t.id === editingId
            ? {
                ...t,
                user_category: updates.user_category,
                notes: updates.notes,
                // is_recurring is not updated since it's not editable
              }
            : t
        )
      );

      setEditingId(null);
      setEditingTransaction(null);
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTransaction(null);
  };

  // Since filtering is now done on the backend, we just use the transactions directly
  // Calculate balances for current transactions
  const { transactions: transactionsWithBalance } =
    calculateBalances(transactions);

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-emerald-400 text-2xl font-bold">
                Transaction History
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Click any transaction to edit category and notes
              </p>
            </div>
            {loading && (
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
            )}
            {error && <AlertCircle className="h-5 w-5 text-red-400" />}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-500/50 rounded-xl"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors duration-300">
                <Filter className="h-4 w-4 mr-2 text-cyan-400" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
                <SelectItem
                  value="all"
                  className="text-slate-300 hover:text-white hover:bg-white/10"
                >
                  All Categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSyncTransactions}
              disabled={syncing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync"}
            </Button>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-300">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  fetchTransactions();
                }}
                size="sm"
                variant="outline"
                className="ml-auto text-red-300 border-red-500/30 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
        {showAddForm && (
          <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">
              Add New Transaction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl"
              />
              <Select
                value={newTransaction.type}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, type: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem
                    value="expense"
                    className="text-white hover:bg-white/10"
                  >
                    Expense
                  </SelectItem>
                  <SelectItem
                    value="income"
                    className="text-white hover:bg-white/10"
                  >
                    Income
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newTransaction.paymentType}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, paymentType: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {paymentTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="text-white hover:bg-white/10"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Transaction Name"
                value={newTransaction.name}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, name: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl"
              />
              <Select
                value={newTransaction.category}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, category: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white hover:bg-white/10"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl"
              />
              <div className="flex items-center space-x-3">
                <Switch
                  checked={newTransaction.isRecurring}
                  onCheckedChange={(checked) =>
                    setNewTransaction({
                      ...newTransaction,
                      isRecurring: checked,
                    })
                  }
                  className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-slate-600 border-2 data-[state=checked]:border-cyan-400 data-[state=unchecked]:border-slate-500"
                />
                <label
                  className="text-sm text-white font-medium cursor-pointer"
                  onClick={() =>
                    setNewTransaction({
                      ...newTransaction,
                      isRecurring: !newTransaction.isRecurring,
                    })
                  }
                >
                  {newTransaction.isRecurring ? "Recurring" : "One-time"}
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addTransaction}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-colors duration-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-white/5">
                  <TableHead className="text-slate-300 font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Type
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Category
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Recurring
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Notes
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold text-right">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsWithBalance.map((transaction) => {
                  const isEditing = editingId === transaction.id;
                  const balance =
                    typeof transaction.balance === "number"
                      ? transaction.balance
                      : 0;

                  return (
                    <TableRow
                      key={transaction.id}
                      className={`border-b border-white/5 hover:bg-white/10 transition-colors duration-200 group ${
                        isEditing ? "bg-emerald-500/10" : ""
                      } ${!isEditing ? "cursor-pointer" : ""}`}
                      onClick={() => !isEditing && startEditing(transaction)}
                    >
                      <TableCell className="text-white">
                        {isEditing ? (
                          <div className="text-slate-400 text-sm">
                            {new Date(
                              editingTransaction.date_posted ||
                                editingTransaction.date
                            ).toLocaleDateString()}
                            <div className="text-xs text-slate-500 mt-1">
                              Date cannot be modified
                            </div>
                          </div>
                        ) : (
                          new Date(
                            transaction.date_posted || transaction.date
                          ).toLocaleDateString()
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="text-slate-400 text-sm">
                            <Badge
                              variant={
                                editingTransaction.type === "income"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                editingTransaction.type === "income"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              }
                            >
                              {editingTransaction.type === "income"
                                ? "Income"
                                : "Expense"}
                            </Badge>
                            <div className="text-xs text-slate-500 mt-1">
                              Type cannot be modified
                            </div>
                          </div>
                        ) : (
                          <Badge
                            variant={
                              transaction.type === "income"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              transaction.type === "income"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                                : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                            }
                          >
                            {transaction.type === "income"
                              ? "Income"
                              : "Expense"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {isEditing ? (
                          <div className="text-slate-400 text-sm">
                            {editingTransaction.name}
                            <div className="text-xs text-slate-500 mt-1">
                              Description cannot be modified
                            </div>
                          </div>
                        ) : (
                          transaction.name
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={
                              editingTransaction.user_category ||
                              editingTransaction.category
                            }
                            onValueChange={(value) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                user_category: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/10">
                              {categories.map((category) => (
                                <SelectItem
                                  key={category}
                                  value={category}
                                  className="text-white hover:bg-white/10"
                                >
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${getCategoryColor(
                              transaction.user_category || transaction.category
                            )}`}
                            title={
                              transaction.plaid_category
                                ? `Plaid: ${transaction.plaid_category}`
                                : undefined
                            }
                          >
                            {transaction.user_category ||
                              transaction.category ||
                              "Uncategorized"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {isEditing ? (
                          <div className="text-right text-slate-400 text-sm">
                            {`${
                              editingTransaction.type === "income" ? "+" : "-"
                            }$${(editingTransaction.amount || 0).toFixed(2)}`}
                            <div className="text-xs text-slate-500 mt-1">
                              Amount cannot be modified
                            </div>
                          </div>
                        ) : (
                          `${transaction.type === "income" ? "+" : "-"}$${(
                            transaction.amount || 0
                          ).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="text-slate-400 text-sm">
                            <Badge
                              variant="outline"
                              className={
                                editingTransaction.is_recurring ||
                                editingTransaction.isRecurring
                                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                  : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                              }
                            >
                              {editingTransaction.is_recurring ||
                              editingTransaction.isRecurring
                                ? "Recurring"
                                : "One-time"}
                            </Badge>
                            <div className="text-xs text-slate-500 mt-1">
                              Recurring status cannot be modified
                            </div>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              transaction.is_recurring ||
                              transaction.isRecurring
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                                : "bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-500/25"
                            }
                          >
                            {transaction.is_recurring || transaction.isRecurring
                              ? "Recurring"
                              : "One-time"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {isEditing ? (
                          <Input
                            placeholder="Add notes..."
                            value={editingTransaction.notes || ""}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                notes: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl"
                          />
                        ) : (
                          <span className="text-slate-400 text-sm">
                            {transaction.notes || "No notes"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-white">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          `$${balance.toFixed(2)}`
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {transactionsWithBalance.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {error
                ? "Error loading transactions"
                : autoRefreshing
                ? "Loading transactions from your bank..."
                : "No transactions found"}
            </p>
            {autoRefreshing && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Automatically syncing transactions...
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  This may take a few moments for new accounts
                </p>
              </div>
            )}
            {!autoRefreshing && !error && (
              <Button
                onClick={handleSyncTransactions}
                className="mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                disabled={syncing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing ? "Syncing..." : "Sync Transactions"}
              </Button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalTransactions > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            {/* Transaction Count Info */}
            <div className="text-center mb-4">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, totalTransactions)} of{" "}
                {totalTransactions} transactions
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {/* First Page */}
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <Button
                      onClick={() => setCurrentPage(1)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                    >
                      1
                    </Button>
                    {currentPage > 4 && (
                      <span className="text-slate-400 px-2">...</span>
                    )}
                  </>
                )}

                {/* Previous Button */}
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl disabled:opacity-50"
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={
                          currentPage === page
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 rounded-xl min-w-[40px]"
                            : "border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl min-w-[40px] transition-all duration-200"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl disabled:opacity-50"
                >
                  Next
                </Button>

                {/* Last Page */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-slate-400 px-2">...</span>
                    )}
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Page Jump Input for Large Datasets */}
            {totalPages > 10 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-sm text-slate-400">Go to page:</span>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-20 h-8 text-center bg-white/5 border-white/10 text-white rounded-xl"
                />
                <span className="text-sm text-slate-400">of {totalPages}</span>
              </div>
            )}

            {/* Keyboard Navigation Hint */}
            {totalPages > 1 && (
              <div className="text-center mt-3">
                <span className="text-xs text-slate-500">
                  Use ← → arrow keys to navigate pages
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
