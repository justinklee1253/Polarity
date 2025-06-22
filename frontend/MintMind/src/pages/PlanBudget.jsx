import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Target,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";

const PlanBudget = () => {
  // Mock data - replace with actual API data
  const budgetData = {
    monthlyIncome: 1500,
    totalBudget: 1200,
    spent: 850,
    categories: [
      { name: "Food", budgeted: 300, spent: 280, color: "bg-sky-500" },
      { name: "Transport", budgeted: 150, spent: 120, color: "bg-cyan-500" },
      {
        name: "Entertainment",
        budgeted: 200,
        spent: 250,
        color: "bg-blue-500",
      },
      {
        name: "Books/Supplies",
        budgeted: 100,
        spent: 75,
        color: "bg-indigo-500",
      },
      { name: "Personal", budgeted: 150, spent: 125, color: "bg-purple-500" },
      { name: "Emergency", budgeted: 300, spent: 0, color: "bg-green-500" },
    ],
  };

  const remaining = budgetData.totalBudget - budgetData.spent;
  const progressPercentage = (budgetData.spent / budgetData.totalBudget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                Budget Planner
              </h1>
              <p className="text-gray-600">
                Manage and track your monthly budget
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Monthly Income
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${budgetData.monthlyIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Budget
              </CardTitle>
              <Target className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600">
                ${budgetData.totalBudget.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Amount Spent
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${budgetData.spent.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Remaining
              </CardTitle>
              <Calendar className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  remaining >= 0 ? "text-cyan-600" : "text-red-600"
                }`}
              >
                ${Math.abs(remaining).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sky-700 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Budget Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${budgetData.spent}</span>
                  <span>Budget: ${budgetData.totalBudget}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              <div className="text-sm text-gray-600">
                {progressPercentage < 80
                  ? "🟢 You're doing great with your budget!"
                  : progressPercentage < 100
                  ? "🟡 Getting close to your budget limit"
                  : "🔴 You've exceeded your budget"}
              </div>
              <div className="pt-4">
                <Button className="w-full bg-sky-600 hover:bg-sky-700">
                  Add Transaction
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-cyan-700 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetData.categories.map((category, index) => {
                  const categoryProgress =
                    (category.spent / category.budgeted) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${category.spent} / ${category.budgeted}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color} ${
                            categoryProgress > 100 ? "bg-red-500" : ""
                          }`}
                          style={{
                            width: `${Math.min(categoryProgress, 100)}%`,
                          }}
                        ></div>
                      </div>
                      {categoryProgress > 100 && (
                        <span className="text-xs text-red-600">
                          Over budget by ${category.spent - category.budgeted}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="w-full border-sky-200 text-sky-700 hover:bg-sky-50"
          >
            Edit Budget Categories
          </Button>
          <Button
            variant="outline"
            className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50"
          >
            View Transaction History
          </Button>
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Export Budget Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanBudget;
