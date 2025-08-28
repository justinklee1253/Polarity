import React, { useState, useEffect } from "react";
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
import { Plus, Filter, Search } from "lucide-react";

const TransactionTable = ({ currentBalance = 0, onTransactionsUpdate }) => {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "2024-01-15",
      type: "expense",
      paymentType: "Credit Card",
      name: "Grocery Shopping",
      category: "Food",
      amount: 85.5,
      isRecurring: false,
    },
    {
      id: 2,
      date: "2024-01-14",
      type: "income",
      paymentType: "Direct Deposit",
      name: "Part-time Job",
      category: "Income",
      amount: 450.0,
      isRecurring: true,
    },
  ]);

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

  const categories = [
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
  ];

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

  // Calculate running balances and monthly spent
  const calculateBalances = (transactionList) => {
    let runningBalance = currentBalance;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let monthlySpent = 0;

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactionList].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const transactionsWithBalance = sortedTransactions.map((transaction) => {
      const transactionDate = new Date(transaction.date);
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

  // Recalculate balances whenever transactions change
  useEffect(() => {
    const { monthlySpent } = calculateBalances(transactions);
    if (onTransactionsUpdate) {
      onTransactionsUpdate(monthlySpent);
    }
  }, [transactions, currentBalance, onTransactionsUpdate]);

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

  const saveEdit = () => {
    setTransactions(
      transactions.map((t) =>
        t.id === editingId
          ? {
              ...editingTransaction,
              amount: parseFloat(editingTransaction.amount),
            }
          : t
      )
    );
    setEditingId(null);
    setEditingTransaction(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || transaction.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate balances for filtered transactions
  const { transactions: transactionsWithBalance } =
    calculateBalances(filteredTransactions);

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-emerald-400 text-2xl font-bold">
            Transaction History
          </CardTitle>
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
                    Payment
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
                          <Input
                            type="date"
                            value={editingTransaction.date}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                date: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        ) : (
                          new Date(transaction.date).toLocaleDateString()
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={editingTransaction.type}
                            onValueChange={(value) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                type: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl">
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
                      <TableCell className="text-slate-300">
                        {isEditing ? (
                          <Select
                            value={editingTransaction.paymentType}
                            onValueChange={(value) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                paymentType: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl">
                              <SelectValue />
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
                        ) : (
                          transaction.paymentType
                        )}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {isEditing ? (
                          <Input
                            value={editingTransaction.name}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                name: e.target.value,
                              })
                            }
                            className="w-full bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        ) : (
                          transaction.name
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={editingTransaction.category}
                            onValueChange={(value) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                category: value,
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
                              transaction.category
                            )}`}
                          >
                            {transaction.category}
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
                          <Input
                            type="number"
                            value={editingTransaction.amount}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                amount: e.target.value,
                              })
                            }
                            className="w-full text-right bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        ) : (
                          `${transaction.type === "income" ? "+" : "-"}$${(
                            transaction.amount || 0
                          ).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={editingTransaction.isRecurring}
                              onCheckedChange={(checked) =>
                                setEditingTransaction({
                                  ...editingTransaction,
                                  isRecurring: checked,
                                })
                              }
                              className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-slate-600 border-2 data-[state=checked]:border-cyan-400 data-[state=unchecked]:border-slate-500"
                            />
                            <label
                              className="text-sm text-white font-medium cursor-pointer"
                              onClick={() =>
                                setEditingTransaction({
                                  ...editingTransaction,
                                  isRecurring: !editingTransaction.isRecurring,
                                })
                              }
                            >
                              {editingTransaction.isRecurring
                                ? "Recurring"
                                : "One-time"}
                            </label>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              transaction.isRecurring
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                                : "bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-500/25"
                            }
                          >
                            {transaction.isRecurring ? "Recurring" : "One-time"}
                          </Badge>
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

        {transactionsWithBalance.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
