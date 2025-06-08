import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FinancialSlide = ({ onComplete, onPrev, onDataUpdate, data }) => {
  const [monthlySalary, setMonthlySalary] = useState(
    data.monthlySalary?.toString() || ""
  );
  const [monthlySpendingGoal, setMonthlySpendingGoal] = useState(
    data.monthlySpendingGoal?.toString() || ""
  );
  const [currentBalance, setCurrentBalance] = useState(
    data.currentBalance?.toString() || ""
  );

  const handleComplete = () => {
    const financialData = {
      monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null,
      monthlySpendingGoal: monthlySpendingGoal
        ? parseFloat(monthlySpendingGoal)
        : null,
      currentBalance: currentBalance ? parseFloat(currentBalance) : null,
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
    currentBalance &&
    isValidNumber(monthlySalary) &&
    isValidNumber(monthlySpendingGoal) &&
    isValidNumber(currentBalance);

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
              onChange={(e) => setMonthlySalary(e.target.value)}
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
              onChange={(e) => setMonthlySpendingGoal(e.target.value)}
              className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500 transition-colors text-lg"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="current-balance"
              className="text-sm font-medium text-gray-700"
            >
              Current Available Balance ($)
            </Label>
            <Input
              id="current-balance"
              type="number"
              placeholder="0.00"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500 transition-colors text-lg"
              min="0"
              step="0.01"
            />
          </div>
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
            onClick={handleComplete}
            disabled={!canContinue}
            className="flex-1 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSlide;
