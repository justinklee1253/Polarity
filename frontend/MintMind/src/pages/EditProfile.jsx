import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Lock,
  Banknote,
  Target,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { createPlaidLinkToken, exchangePublicToken } from "@/services/plaid";
import {
  updateEmail,
  updatePassword,
  updateFinancialInfo,
} from "@/services/profile";

const EditProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    monthlyIncome: "",
    monthlySpendingGoal: "",
    financialGoals: [],
  });

  // Original data to track changes
  const [originalData, setOriginalData] = useState({
    email: "",
    monthlyIncome: "",
    monthlySpendingGoal: "",
    financialGoals: [],
  });

  // Validation states
  const [validation, setValidation] = useState({
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
    monthlyIncome: false,
    monthlySpendingGoal: false,
  });

  // Change detection
  const [hasChanges, setHasChanges] = useState({
    email: false,
    password: false,
    financial: false,
  });

  // Financial goals options
  const availableGoals = [
    "Save for emergency fund",
    "Pay off debt",
    "Save for vacation",
    "Buy a house",
    "Retirement planning",
    "Build credit score",
    "Start investing",
    "Save for education",
    "Start a business",
    "Other financial goals",
  ];

  // Plaid Link success handler
  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    try {
      setUpdating(true);

      // Exchange public token for access token and update balance
      const { data } = await exchangePublicToken(public_token);

      toast({
        title: "Bank Account Connected",
        description: `Successfully connected ${
          metadata.institution?.name || "your bank account"
        }`,
      });

      // Update user data with new bank connection info
      setUserData((prev) => ({
        ...prev,
        plaid_access_token: data.access_token,
        budget_profile: {
          ...prev.budget_profile,
          total_balance: data.total_balance,
        },
      }));

      // Reset link token
      setLinkToken(null);
    } catch (error) {
      console.error("Bank connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }, []);

  // Plaid Link hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => {
      setLinkToken(null);
      setUpdating(false);
    },
  });

  // Open Plaid Link when token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Form validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setValidation({
      email: emailRegex.test(formData.email),
      currentPassword: formData.currentPassword.length >= 6,
      newPassword: formData.newPassword.length >= 6,
      confirmPassword:
        formData.newPassword === formData.confirmPassword &&
        formData.confirmPassword.length > 0,
      monthlyIncome: parseFloat(formData.monthlyIncome) >= 0,
      monthlySpendingGoal: parseFloat(formData.monthlySpendingGoal) >= 0,
    });
  }, [formData]);

  // Change detection
  useEffect(() => {
    setHasChanges({
      email: formData.email !== originalData.email,
      password:
        formData.currentPassword.length > 0 || formData.newPassword.length > 0,
      financial:
        formData.monthlyIncome !== originalData.monthlyIncome ||
        formData.monthlySpendingGoal !== originalData.monthlySpendingGoal ||
        JSON.stringify(formData.financialGoals.sort()) !==
          JSON.stringify(originalData.financialGoals.sort()),
    });
  }, [formData, originalData]);

  const fetchUserData = async () => {
    try {
      const { data } = await getCurrentUser();
      setUserData(data);

      const initialData = {
        email: data.email || "",
        monthlyIncome: (data.budget_profile?.salary_monthly || "").toString(),
        monthlySpendingGoal: (
          data.budget_profile?.monthly_spending_goal || ""
        ).toString(),
        financialGoals: data.profile_info?.financial_goals || [],
      };

      setFormData({
        ...initialData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setOriginalData(initialData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleFinancialGoal = (goal) => {
    setFormData((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal],
    }));
  };

  const handleUpdateEmail = async () => {
    if (!validation.email || !validation.currentPassword) {
      toast({
        title: "Invalid Information",
        description: "Please provide a valid email and current password",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      await updateEmail({
        email: formData.email,
        current_password: formData.currentPassword,
      });

      toast({
        title: "Email Updated",
        description: "Your email has been successfully updated",
      });

      // Update local user data and reset original data
      setUserData((prev) => ({
        ...prev,
        email: formData.email,
      }));

      setOriginalData((prev) => ({
        ...prev,
        email: formData.email,
      }));

      // Clear current password after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
      }));
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !validation.currentPassword ||
      !validation.newPassword ||
      !validation.confirmPassword
    ) {
      toast({
        title: "Invalid Information",
        description: "Please fill in all password fields correctly",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      await updatePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated",
      });

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateFinancials = async () => {
    setUpdating(true);
    try {
      const { data } = await updateFinancialInfo({
        monthly_income: formData.monthlyIncome,
        monthly_spending_goal: formData.monthlySpendingGoal,
        financial_goals: formData.financialGoals,
      });

      toast({
        title: "Financial Information Updated",
        description: "Your financial information has been successfully updated",
      });

      // Update local user data with returned data
      setUserData((prev) => ({
        ...prev,
        budget_profile: data.budget_profile,
        profile_info: {
          ...prev.profile_info,
          financial_goals: data.financial_goals,
        },
      }));

      // Update original data to reflect saved state
      setOriginalData((prev) => ({
        ...prev,
        monthlyIncome: formData.monthlyIncome,
        monthlySpendingGoal: formData.monthlySpendingGoal,
        financialGoals: formData.financialGoals,
      }));
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error.message ||
          "Failed to update financial information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleReconnectBank = useCallback(async () => {
    setUpdating(true);
    try {
      // Create a new link token for Plaid reconnection
      const { data } = await createPlaidLinkToken();

      if (data?.link_token) {
        setLinkToken(data.link_token);
        // Plaid Link will open automatically via useEffect
      } else {
        throw new Error("Failed to create link token");
      }
    } catch (error) {
      console.error("Bank reconnection error:", error);
      toast({
        title: "Reconnection Failed",
        description: "Failed to initiate bank reconnection. Please try again.",
        variant: "destructive",
      });
      setUpdating(false);
    }
  }, []);

  const renderInput = (
    field,
    type = "text",
    placeholder = "",
    icon = null,
    isPassword = false
  ) => {
    const showPasswordField =
      isPassword &&
      ((field === "currentPassword" && showCurrentPassword) ||
        (field === "newPassword" && showNewPassword) ||
        (field === "confirmPassword" && showConfirmPassword));

    return (
      <div className="space-y-3">
        <Label
          htmlFor={field}
          className={`text-sm font-medium transition-all duration-300 flex items-center ${
            focusedField === field ? "text-emerald-400" : "text-slate-300"
          }`}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {field === "email" && "Email Address"}
          {field === "currentPassword" && "Current Password"}
          {field === "newPassword" && "New Password"}
          {field === "confirmPassword" && "Confirm New Password"}
          {field === "monthlyIncome" && "Monthly Income ($)"}
          {field === "monthlySpendingGoal" && "Monthly Spending Goal ($)"}
          {validation[field] && (
            <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-400 animate-in fade-in duration-300" />
          )}
        </Label>
        <div className="relative">
          <Input
            id={field}
            type={isPassword ? (showPasswordField ? "text" : "password") : type}
            placeholder={placeholder}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            className={`h-12 bg-white/5 border transition-all duration-300 text-white placeholder:text-slate-400 rounded-xl ${
              isPassword ? "pr-12" : ""
            } ${
              focusedField === field
                ? "border-emerald-500/50 shadow-lg shadow-emerald-500/25 bg-white/10"
                : validation[field]
                ? "border-emerald-500/30 bg-white/5"
                : "border-white/10 hover:border-white/20"
            }`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => {
                if (field === "currentPassword")
                  setShowCurrentPassword(!showCurrentPassword);
                if (field === "newPassword")
                  setShowNewPassword(!showNewPassword);
                if (field === "confirmPassword")
                  setShowConfirmPassword(!showConfirmPassword);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-all duration-300 focus:outline-none hover:scale-110"
              tabIndex={-1}
            >
              {showPasswordField ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
              focusedField === field ? "opacity-100" : ""
            }`}
          />
        </div>
      </div>
    );
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
            Loading Profile
          </h2>
          <p className="text-slate-300">Fetching your account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-emerald-900/30" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-10 w-32 h-32 border border-emerald-500/10 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-24 h-24 border border-cyan-500/10 rounded-lg animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <div className="absolute top-1/2 left-5 w-16 h-16 border border-emerald-400/10 rotate-45 animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent animate-pulse">
              Edit Profile
            </h1>
            <p className="text-slate-300 text-lg font-light">
              Update your account information and preferences
            </p>
          </div>

          {/* Account Information */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden animate-in fade-in duration-1000 delay-300">
            <CardHeader className="space-y-1 p-8">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-emerald-400" />
                <div>
                  <CardTitle className="text-2xl font-semibold text-white">
                    Account Information
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Update your email address and login credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">
              {/* Username (read-only) */}
              <div className="space-y-3">
                <Label className="text-slate-300 font-medium">Username</Label>
                <Input
                  value={userData?.username || ""}
                  disabled
                  className="h-12 bg-slate-800/50 border-slate-700/50 text-slate-400 cursor-not-allowed rounded-xl"
                />
                <p className="text-sm text-slate-500">
                  Username cannot be changed
                </p>
              </div>

              {/* Email Update Section */}
              <div className="space-y-6 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-white text-lg">
                    Update Email
                  </h3>
                </div>

                <div className="space-y-6">
                  {renderInput(
                    "email",
                    "email",
                    "Enter new email address",
                    <Mail className="w-4 h-4" />
                  )}
                  {renderInput(
                    "currentPassword",
                    "password",
                    "Enter your current password",
                    <Lock className="w-4 h-4" />,
                    true
                  )}

                  {hasChanges.email && (
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={
                        updating ||
                        !validation.email ||
                        !validation.currentPassword
                      }
                      className="w-full h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/25 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      {updating ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <span className="relative z-10 flex items-center justify-center">
                          <Save className="mr-2 h-4 w-4" />
                          Save Email Changes
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Password Update Section */}
              <div className="space-y-6 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white text-lg">
                    Change Password
                  </h3>
                </div>

                <div className="space-y-6">
                  {renderInput(
                    "currentPassword",
                    "password",
                    "Enter your current password",
                    <Lock className="w-4 h-4" />,
                    true
                  )}
                  {renderInput(
                    "newPassword",
                    "password",
                    "Enter new password",
                    <Lock className="w-4 h-4" />,
                    true
                  )}
                  {renderInput(
                    "confirmPassword",
                    "password",
                    "Confirm new password",
                    <Lock className="w-4 h-4" />,
                    true
                  )}

                  {hasChanges.password && (
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={
                        updating ||
                        !validation.currentPassword ||
                        !validation.newPassword ||
                        !validation.confirmPassword
                      }
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      {updating ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <span className="relative z-10 flex items-center justify-center">
                          <Save className="mr-2 h-4 w-4" />
                          Save Password Changes
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden animate-in fade-in duration-1000 delay-500">
            <CardHeader className="space-y-1 p-8">
              <div className="flex items-center gap-3">
                <Banknote className="h-6 w-6 text-green-400" />
                <div>
                  <CardTitle className="text-2xl font-semibold text-white">
                    Financial Information
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Update your income, spending goals, and financial objectives
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput(
                  "monthlyIncome",
                  "number",
                  "Enter monthly income",
                  <Banknote className="w-4 h-4" />
                )}
                {renderInput(
                  "monthlySpendingGoal",
                  "number",
                  "Enter spending goal",
                  <Target className="w-4 h-4" />
                )}
              </div>

              <Separator className="bg-slate-700/50" />

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-white text-lg">
                    Financial Goals
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableGoals.map((goal) => (
                    <div
                      key={goal}
                      onClick={() => toggleFinancialGoal(goal)}
                      className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        formData.financialGoals.includes(goal)
                          ? "border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/10"
                          : "border-slate-700/50 bg-slate-800/30 hover:border-green-500/30 hover:bg-green-500/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            formData.financialGoals.includes(goal)
                              ? "text-green-300"
                              : "text-slate-300 group-hover:text-green-400"
                          }`}
                        >
                          {goal}
                        </span>
                        {formData.financialGoals.includes(goal) && (
                          <CheckCircle className="h-4 w-4 text-green-400 animate-in fade-in zoom-in duration-200" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hasChanges.financial && (
                <Button
                  onClick={handleUpdateFinancials}
                  disabled={updating}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/25 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  {updating ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center">
                      <Save className="mr-2 h-4 w-4" />
                      Save Financial Changes
                    </span>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Bank Account */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden animate-in fade-in duration-1000 delay-700">
            <CardHeader className="space-y-1 p-8">
              <div className="flex items-center gap-3">
                <Banknote className="h-6 w-6 text-blue-400" />
                <div>
                  <CardTitle className="text-2xl font-semibold text-white">
                    Bank Account
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Manage your connected bank account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      userData?.plaid_access_token
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    <Banknote
                      className={`h-6 w-6 ${
                        userData?.plaid_access_token
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">
                      {userData?.plaid_access_token
                        ? "Bank Account Connected"
                        : "No Bank Account Connected"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {userData?.plaid_access_token
                        ? `Current Balance: $${
                            userData.budget_profile?.total_balance || "0.00"
                          }`
                        : "Connect your bank account to track spending"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {userData?.plaid_access_token ? (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={handleReconnectBank}
                disabled={updating}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                {updating ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {userData?.plaid_access_token
                      ? "Reconnect Bank Account"
                      : "Connect Bank Account"}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
