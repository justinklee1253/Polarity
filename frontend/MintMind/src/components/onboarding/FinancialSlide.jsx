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
      console.log("Bank connected successfully. Balance:", data.total_balance);

      // Give transaction sync a moment to complete
      console.log("Allowing time for transaction sync...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      // Check if onboarding was completed by the backend
      if (data.onboarding_completed) {
        // Backend confirmed onboarding is complete - redirect immediately
        console.log("Onboarding completed immediately via Plaid connection");
        await onComplete(true); // Pass flag to indicate immediate completion
      } else {
        // Backend says onboarding not complete yet - let polling handle it
        console.log(
          "Plaid connected but onboarding not complete:",
          data.message
        );
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
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Let's set up your finances
        </CardTitle>
        <p className="text-gray-600">
          This information helps us create personalized budgets and insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="salary"
              className="text-sm font-medium text-gray-700"
            >
              Monthly Income ($)
            </Label>
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
              className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500 transition-colors text-lg"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="spending-goal"
              className="text-sm font-medium text-gray-700"
            >
              Monthly Spending Goal ($)
            </Label>
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
              className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500 transition-colors text-lg"
              min="0"
              step="0.01"
            />
          </div>

          {/* Removed Current Available Balance field */}
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-4 rounded-lg border border-sky-100">
          <p className="text-gray-700 text-sm text-center">
            Don't worry, you can always update these values later in your
            settings.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onPrev}
            variant="outline"
            className="flex-1 h-12 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back
          </Button>
          <Button
            onClick={handleConnectBank}
            disabled={!canContinue || !!linkToken || isConnecting} // Only enabled if both fields are valid and not already connecting
            className="flex-1 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              "Connect Bank Account"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSlide;
