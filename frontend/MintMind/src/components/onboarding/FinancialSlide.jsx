import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlaidLink } from "react-plaid-link";
import {
  createPlaidLinkToken,
  updateUserBalance,
  exchangePublicToken,
} from "@/services/plaid";
import { apiService } from "@/services/api";
import {
  DollarSign,
  ChevronLeft,
  Banknote,
  TrendingUp,
  Shield,
  Loader2,
  CreditCard,
} from "lucide-react";
import plaidImg from "@/assets/images/plaidboo2.png";

const FinancialSlide = ({ onComplete, onPrev, onDataUpdate, data }) => {
  const [monthlySalary, setMonthlySalary] = useState("");
  const [monthlySpendingGoal, setMonthlySpendingGoal] = useState("");
  const [linkToken, setLinkToken] = useState(null);
  const [plaidReady, setPlaidReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const onPlaidSuccess = async (public_token, metadata) => {
    try {
      setIsConnecting(true); //indicate bank connection is in progress --> UI spinner

      // Exchange public_token for access_token (this also fetches and stores balance)
      const { data } = await exchangePublicToken(public_token);
      // console.log("Bank connected successfully. Balance:", data.total_balance);

      // Give transaction sync a moment to complete
      // console.log("Allowing time for transaction sync...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      // Check if onboarding was completed by the backend
      if (data.onboarding_completed) {
        // Backend confirmed onboarding is complete - redirect immediately
        // console.log("Onboarding completed immediately via Plaid connection");
        await onComplete(true); // Pass flag to indicate immediate completion
      } else {
        // Backend says onboarding not complete yet - let polling handle it
        // console.log(
        //   "Plaid connected but onboarding not complete:",
        //   data.message
        // );
        await onComplete(); // Trigger normal completion flow with polling
      }
    } catch (err) {
      // Show error to user
      console.error("Plaid onboarding error:", err);
      setIsConnecting(false);
      // Optionally show a toast or error message
    }
  };

  // This hook will be called only after linkToken is set
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess, //callback function plaid link calls when user successfully completes bank connection.
    onExit: () => setLinkToken(null), // reset if user closes Plaid Link
  });

  const handleConnectBank = useCallback(async () => {
    //memoizes function to prevent re-rendering. Function only created once when component mounts
    try {
      const { data } = await createPlaidLinkToken(); //calls service function from plaid.js to make request for link token
      setLinkToken(data.link_token);
      setPlaidReady(true);
      // open() will be called in the next effect
    } catch (err) {
      // handle error
    }
  }, []);

  // Open Plaid Link when linkToken is set and ready
  useEffect(() => {
    if (linkToken && ready) {
      open(); //opens Plaid Link modal popup window where users actually connect their bank account.
    }
  }, [linkToken, ready, open]);

  const handleComplete = () => {
    const financialData = {
      monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null,
      monthlySpendingGoal: monthlySpendingGoal
        ? parseFloat(monthlySpendingGoal)
        : null,
    };

    onDataUpdate(financialData);
    onComplete();
  };

  const isValidNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  const canContinue =
    monthlySalary &&
    monthlySpendingGoal &&
    isValidNumber(monthlySalary) &&
    isValidNumber(monthlySpendingGoal);

  return (
    <div className="relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-6 left-6 w-3 h-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s", animationDuration: "4.2s" }}
        />
        <div
          className="absolute top-28 right-10 w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-emerald-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1.7s", animationDuration: "3.8s" }}
        />
        <div
          className="absolute bottom-24 left-8 w-4 h-4 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2.3s", animationDuration: "4.5s" }}
        />
        <div
          className="absolute bottom-8 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "1.1s", animationDuration: "3.7s" }}
        />
      </div>

      <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 ease-out transform hover:bg-white/10 animate-in fade-in duration-500">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-emerald-900/10 pointer-events-none" />

        <CardHeader className="text-center space-y-4 pt-6 pb-4 relative">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white leading-relaxed">
              Let's set up your finances
            </CardTitle>
            <p className="text-slate-300 text-base font-medium">
              This information helps us create personalized budgets
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-6 relative">
          <div className="space-y-4">
            {/* Enhanced salary input */}
            <div className="space-y-3">
              <Label
                htmlFor="salary"
                className="text-base font-semibold text-slate-200 text-center block"
              >
                Monthly Income ($)
              </Label>
              <div className="relative">
                <Input
                  id="salary"
                  type="number"
                  placeholder="0.00"
                  value={monthlySalary}
                  onChange={(e) => {
                    setMonthlySalary(e.target.value);
                    onDataUpdate({
                      monthlySalary: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    });
                  }}
                  className="h-12 px-4 border border-white/20 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 text-lg rounded-2xl bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md text-white placeholder:text-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Enhanced spending goal input */}
            <div className="space-y-3">
              <Label
                htmlFor="spending-goal"
                className="text-base font-semibold text-slate-200 text-center block"
              >
                Monthly Spending Goal ($)
              </Label>
              <div className="relative">
                <Input
                  id="spending-goal"
                  type="number"
                  placeholder="0.00"
                  value={monthlySpendingGoal}
                  onChange={(e) => {
                    setMonthlySpendingGoal(e.target.value);
                    onDataUpdate({
                      monthlySpendingGoal: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    });
                  }}
                  className="h-12 px-4 border border-white/20 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 text-lg rounded-2xl bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md text-white placeholder:text-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Enhanced info card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-white/5 via-emerald-500/5 to-cyan-500/5 p-4 rounded-2xl border border-emerald-400/20 shadow-inner backdrop-blur-sm">
              <p className="text-slate-300 text-sm text-center font-medium">
                Don't worry, you can always update these values later in your
                settings.
              </p>
            </div>
          </div>

          {/* Enhanced buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onPrev}
              variant="outline"
              className="flex-1 h-12 border border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 transition-all duration-300 rounded-2xl font-semibold text-slate-300 hover:text-white shadow-sm hover:shadow-md bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handleConnectBank}
              disabled={!canContinue || !!linkToken || isConnecting}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none rounded-2xl shadow-lg"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <img src={plaidImg} alt="Plaid" className="w-5 h-5" />
                  <span>Connect Bank</span>
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSlide;
