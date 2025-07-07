import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wallet, Target, GraduationCap, DollarSign } from "lucide-react";
import TransactionTable from "@/components/TransactionTable";
import { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonthlySpent, setCurrentMonthlySpent] = useState(0); // You'll need to implement this based on your transactions

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token"); // Adjust based on how you store your JWT

      if (!token) {
        navigate("/auth");
        return;
      }

      // Use full URL if your backend is on a different port
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"; // Adjust to your backend URL
      const response = await fetch(`${apiUrl}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response is not JSON:", text);
        throw new Error(`Expected JSON but got: ${contentType}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          navigate("/auth");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (token) {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      localStorage.removeItem("access_token");
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("access_token");
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const { budget_profile, profile_info } = userData;

  // Calculate remaining budget
  const monthlyBudget = budget_profile.monthly_spending_goal || 0;
  const remainingBudget = Math.max(monthlyBudget - currentMonthlySpent, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent ml-8 mt-4">
            Welcome back, {userData.name || userData.username}! 👋
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2 ml-8">
            <GraduationCap className="h-4 w-4" />
            {profile_info.college_name || "College Student"}
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
              Monthly Budget
            </CardTitle>
            <Target className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              ${currentMonthlySpent.toLocaleString()}/$
              {monthlyBudget.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              ${remainingBudget.toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        currentBalance={budget_profile.total_balance}
        onTransactionsUpdate={(monthlySpent) =>
          setCurrentMonthlySpent(monthlySpent)
        }
      />
    </div>
  );
}

export default Dashboard;
