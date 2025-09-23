import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Target,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  Activity,
} from "lucide-react";
import TransactionTable from "@/components/TransactionTable";
import SpendingChart from "@/components/SpendingChart";
import { getGamblingSpend, getSpendingOverTime } from "@/services/transactions";
import { useState, useEffect, useRef, useCallback } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonthlySpent, setCurrentMonthlySpent] = useState(0);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [animatedIncome, setAnimatedIncome] = useState(0);
  const [animatedSpent, setAnimatedSpent] = useState(0);
  const [particles, setParticles] = useState([]);
  const [gamblingData, setGamblingData] = useState(null);
  const [spendingChartData, setSpendingChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const balanceRef = useRef(0);
  const incomeRef = useRef(0);
  const spentRef = useRef(0);

  // Generate background particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 15 + 10,
          delay: Math.random() * 5,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  // Count-up animation function
  const animateValue = useCallback((start, end, duration, setter, ref) => {
    if (start === end) return;

    const range = end - start;
    const minTimer = 50;
    const stepTime = Math.abs(Math.floor(duration / range));
    const timer = stepTime < minTimer ? minTimer : stepTime;

    let current = start;
    const increment = end > start ? 1 : -1;

    const obj = setInterval(() => {
      current += increment * Math.ceil(Math.abs(range) / (duration / timer));
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        current = end;
        clearInterval(obj);
      }
      setter(current);
      ref.current = current;
    }, timer);
  }, []);

  // Animate spent amount when it changes
  useEffect(() => {
    if (userData) {
      animateValue(
        spentRef.current,
        currentMonthlySpent,
        1000,
        setAnimatedSpent,
        spentRef
      );
    }
  }, [currentMonthlySpent, userData, animateValue]);

  const fetchUserData = useCallback(async () => {
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

      // Animate values when data loads
      if (data.budget_profile) {
        const balance = data.budget_profile.total_balance || 0;
        const income = data.budget_profile.salary_monthly || 0;

        animateValue(0, balance, 1500, setAnimatedBalance, balanceRef);
        animateValue(0, income, 1500, setAnimatedIncome, incomeRef);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [navigate, animateValue]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch gambling spending and chart data
  const fetchGamblingData = useCallback(async () => {
    try {
      setChartLoading(true);
      const [gamblingResponse, chartResponse] = await Promise.all([
        getGamblingSpend(),
        getSpendingOverTime(),
      ]);

      setGamblingData(gamblingResponse.data);
      setSpendingChartData(chartResponse.data);
    } catch (error) {
      console.error("Error fetching gambling data:", error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      fetchGamblingData();
    }
  }, [userData, fetchGamblingData]);

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
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex justify-center items-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full animate-spin border-t-emerald-500"></div>
              <div className="absolute inset-2 w-12 h-12 border-4 border-cyan-500/20 rounded-full animate-spin animate-reverse border-t-cyan-500"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Dashboard
          </h2>
          <p className="text-slate-300">Fetching your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex justify-center items-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-red-400/10 to-orange-400/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center backdrop-blur-xl bg-white/5 border border-red-500/20 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Retry Loading
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-emerald-900/20" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 right-10 w-24 h-24 border border-emerald-500/5 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute bottom-20 left-10 w-16 h-16 border border-cyan-500/5 rounded-lg animate-pulse"
          style={{ animationDuration: "4s" }}
        />
      </div>

      <div className="relative z-10 p-6 md:p-8 lg:p-10 pt-8 md:pt-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent animate-in fade-in duration-1000">
              Welcome back, {userData.name || userData.username}! 👋
            </h1>
            <p className="text-slate-300 mt-2 flex items-center gap-2 animate-in fade-in duration-1000 delay-300">
              <GraduationCap className="h-5 w-5 text-emerald-400" />
              {profile_info.college_name || "College Student"}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400 animate-in fade-in duration-1000 delay-500"></div>
          </div>
        </div>

        {/* Modern Metric Cards - No Card Outlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Current Balance */}
          <div className="group animate-in fade-in-0 duration-1000 delay-700">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-slate-300 group-hover:text-emerald-300 transition-colors duration-300">
                Current Balance
              </h3>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5 group-hover:text-emerald-300 transition-colors duration-300">
              ${Math.floor(animatedBalance).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Available funds</span>
            </div>
          </div>

          {/* Total Gambling Spend */}
          <div className="group animate-in fade-in-0 duration-1000 delay-1000">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-slate-300 group-hover:text-red-300 transition-colors duration-300">
                Total Gambling Spend
              </h3>
              <div className="p-1.5 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-all duration-300 group-hover:scale-110">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5 group-hover:text-red-300 transition-colors duration-300">
              $
              {gamblingData
                ? gamblingData.current_month_gambling.toLocaleString()
                : "0"}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Activity className="h-3 w-3 text-red-400" />
              <span>This month</span>
            </div>
          </div>

          {/* Gambling Budget with Progress */}
          <div className="group animate-in fade-in-0 duration-1000 delay-1300">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-slate-300 group-hover:text-purple-300 transition-colors duration-300">
                Gambling Budget
              </h3>
              <div className="p-1.5 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-all duration-300 group-hover:scale-110">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">
              $
              {gamblingData
                ? gamblingData.current_month_gambling.toLocaleString()
                : "0"}{" "}
              / ${monthlyBudget.toLocaleString()}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  $
                  {Math.max(
                    monthlyBudget -
                      (gamblingData ? gamblingData.current_month_gambling : 0),
                    0
                  ).toLocaleString()}{" "}
                  left
                </span>
                <span className="text-slate-400">
                  {Math.round(
                    ((gamblingData ? gamblingData.current_month_gambling : 0) /
                      monthlyBudget) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    (gamblingData ? gamblingData.current_month_gambling : 0) /
                      monthlyBudget >
                    0.8
                      ? "bg-red-500"
                      : (gamblingData
                          ? gamblingData.current_month_gambling
                          : 0) /
                          monthlyBudget >
                        0.5
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      ((gamblingData
                        ? gamblingData.current_month_gambling
                        : 0) /
                        monthlyBudget) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-xs text-slate-400">
                ${gamblingData ? gamblingData.daily_average.toFixed(2) : "0.00"}{" "}
                per day
              </div>
            </div>
          </div>
        </div>

        {/* Spending Chart */}
        <div className="mb-6">
          <SpendingChart
            chartData={spendingChartData?.chart_data}
            summary={spendingChartData?.summary}
            loading={chartLoading}
          />
        </div>

        {/* Transaction Table */}
        <div className="animate-in fade-in-0 duration-1000 delay-1500 pb-8">
          <TransactionTable
            currentBalance={budget_profile.total_balance}
            onTransactionsUpdate={(monthlySpent) =>
              setCurrentMonthlySpent(monthlySpent)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
