import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reasons = [
  {
    value: "learn-money-skills",
    label: "Learn smart money skills",
    description: "Build financial literacy and money management habits",
  },
  {
    value: "budget-trip",
    label: "Budget/plan for a trip",
    description: "Save up and plan expenses for travel",
  },
  {
    value: "just-checking",
    label: "Just to check it out",
    description: "Curious about the app and its features",
  },
  {
    value: "manage-expenses",
    label: "Manage daily expenses",
    description: "Track spending and stay within budget",
  },
  {
    value: "save-money",
    label: "Start saving money",
    description: "Build an emergency fund or save for goals",
  },
];

const ReasonSlide = ({ onNext, onPrev, onDataUpdate, data }) => {
  const [reason, setReason] = useState(data.reason);

  const handleReasonSelect = (selectedReason) => {
    setReason(selectedReason);
    onDataUpdate({ reason: selectedReason });
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Why did you download Polarity?
        </CardTitle>
        <p className="text-gray-600">
          This helps us personalize your experience
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {reasons.map((reasonOption) => (
            <button
              key={reasonOption.value}
              onClick={() => handleReasonSelect(reasonOption.value)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                reason === reasonOption.value
                  ? "border-sky-500 bg-sky-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-gray-800 mb-1">
                {reasonOption.label}
              </div>
              <div className="text-sm text-gray-600">
                {reasonOption.description}
              </div>
            </button>
          ))}
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
            onClick={onNext}
            disabled={!reason}
            className="flex-1 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReasonSlide;
