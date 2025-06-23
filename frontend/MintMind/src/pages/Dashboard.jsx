import React, { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Target,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Calendar,
} from "lucide-react";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/auth");
    }
  };

  useEffect(() => {
    //only runs on initial render of component, since data is not subject to change unless user directly modifies it.
    const fetchUser = async () => {
      try {
        const { data } = await apiService.getCurrentUser(); //apiService.getCurrentUser() is an async function that returns a promise
        //when resolved, will return object like {data: ..., response: ...}, {data} is object destructuring in javascript.
        setUserData(data); // data is the actually parsed JSON object
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>No User Data Found</div>;

  const { budget_profile, profile_info } = userData;
  const spendingProgress =
    budget_profile.monthly_spending_goal > 0
      ? Math.min(
          (budget_profile.total_balance /
            budget_profile.monthly_spending_goal) *
            100,
          100
        )
      : 0;

  const remainingBudget = Math.max(
    budget_profile.monthly_spending_goal - budget_profile.total_balance,
    0
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome back, {userData.name || userData.username}! 👋
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            {profile_info.college_name || "College Student"} • Ready to manage
            your finances?
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              ${budget_profile.total_balance?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-600 mt-1">Available funds</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Income
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${budget_profile.salary_monthly?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Budget Left
            </CardTitle>
            <Target className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              ${remainingBudget.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Remaining this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sky-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Budget Progress
            </CardTitle>
            <CardDescription>
              Track your spending against your goal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Spent: $
                  {budget_profile.total_balance?.toLocaleString() || "0"}
                </span>
                <span>
                  Goal: $
                  {budget_profile.monthly_spending_goal?.toLocaleString() ||
                    "0"}
                </span>
              </div>
              <Progress value={spendingProgress} className="h-2" />
            </div>
            <div className="text-sm text-gray-600">
              {spendingProgress < 80
                ? "🟢 You're on track with your spending!"
                : spendingProgress < 100
                ? "🟡 Getting close to your budget limit"
                : "🔴 You've exceeded your monthly budget"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-cyan-700 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Financial Goals
            </CardTitle>
            <CardDescription>
              Your personal financial objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile_info.financial_goals &&
            profile_info.financial_goals.length > 0 ? (
              <div className="space-y-2">
                {profile_info.financial_goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-sky-50 rounded"
                  >
                    <span className="text-sky-600">•</span>
                    <span className="text-sm text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  No financial goals set yet
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Set Goals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Overview
            </CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-medium text-green-600">
                {profile_info.is_student ? "Student" : "User"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Age:</span>
              <span className="text-sm font-medium">
                {profile_info.age || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Onboarding:</span>
              <span className="text-sm font-medium text-green-600">
                {userData.onboarding_completed ? "Complete ✅" : "In Progress"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-700">Quick Actions</CardTitle>
            <CardDescription>Manage your finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-sky-600 hover:bg-sky-700">
              Add Transaction
            </Button>
            <Button
              variant="outline"
              className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50"
            >
              View Budget Details
            </Button>
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Update Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
