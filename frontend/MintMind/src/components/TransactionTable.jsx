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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-sky-700 text-xl font-semibold">
            Transaction History
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-800">
              Add New Transaction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                className="bg-white"
              />
              <Select
                value={newTransaction.type}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, type: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newTransaction.paymentType}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, paymentType: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
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
                className="bg-white"
              />
              <Select
                value={newTransaction.category}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, category: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
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
                className="bg-white"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTransaction.isRecurring}
                  onCheckedChange={(checked) =>
                    setNewTransaction({
                      ...newTransaction,
                      isRecurring: checked,
                    })
                  }
                />
                <label className="text-sm text-gray-600">Recurring</label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addTransaction}
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600 font-medium">
                  Date
                </TableHead>
                <TableHead className="text-gray-600 font-medium">
                  Type
                </TableHead>
                <TableHead className="text-gray-600 font-medium">
                  Payment
                </TableHead>
                <TableHead className="text-gray-600 font-medium">
                  Description
                </TableHead>
                <TableHead className="text-gray-600 font-medium">
                  Category
                </TableHead>
                <TableHead className="text-gray-600 font-medium text-right">
                  Amount
                </TableHead>
                <TableHead className="text-gray-600 font-medium">
                  Recurring
                </TableHead>
                <TableHead className="text-gray-600 font-medium text-right">
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
                    className={`border-gray-100 hover:bg-gray-50/50 ${
                      isEditing ? "bg-blue-50" : ""
                    } ${!isEditing ? "cursor-pointer" : ""}`}
                    onClick={() => !isEditing && startEditing(transaction)}
                  >
                    <TableCell className="text-gray-700">
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
                          className="w-full"
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
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
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
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {transaction.type === "income" ? "Income" : "Expense"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
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
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        transaction.paymentType
                      )}
                    </TableCell>
                    <TableCell className="text-gray-800 font-medium">
                      {isEditing ? (
                        <Input
                          value={editingTransaction.name}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              name: e.target.value,
                            })
                          }
                          className="w-full"
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
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-600 border-gray-300"
                        >
                          {transaction.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
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
                          className="w-full text-right"
                        />
                      ) : (
                        `${transaction.type === "income" ? "+" : "-"}$${(
                          transaction.amount || 0
                        ).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editingTransaction.isRecurring}
                            onCheckedChange={(checked) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                isRecurring: checked,
                              })
                            }
                          />
                          <label className="text-xs text-gray-600">
                            Recurring
                          </label>
                        </div>
                      ) : (
                        transaction.isRecurring && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Recurring
                          </Badge>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-800">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
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
