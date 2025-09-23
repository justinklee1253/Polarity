import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const reasons = [
  {
    value: "quit-gambling",
    label: "Quit/reduce spending on gambling and sports betting",
    description: "Take control of your gambling habits and spending",
  },
  {
    value: "track-betting",
    label: "Track gains/losses in online betting",
    description: "Monitor your betting performance and outcomes",
  },
  {
    value: "build-habits",
    label: "Build smarter financial habits",
    description: "Develop healthier money management practices",
  },
];

const ReasonSlide = ({ onNext, onPrev, onDataUpdate, data }) => {
  const [selectedReasons, setSelectedReasons] = useState(
    Array.isArray(data.reasons)
      ? data.reasons
      : data.reason
      ? [data.reason]
      : []
  );

  const handleReasonToggle = (selectedReason) => {
    let updated;
    if (selectedReasons.includes(selectedReason)) {
      updated = selectedReasons.filter((r) => r !== selectedReason);
    } else {
      updated = [...selectedReasons, selectedReason];
    }
    setSelectedReasons(updated);
    onDataUpdate({ reasons: updated });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-8 left-8 w-3 h-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.4s", animationDuration: "3.8s" }}
        />
        <div
          className="absolute top-32 right-4 w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-emerald-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1.6s", animationDuration: "4.2s" }}
        />
        <div
          className="absolute bottom-28 left-4 w-4 h-4 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2.4s", animationDuration: "3.6s" }}
        />
        <div
          className="absolute bottom-12 right-12 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "0.9s", animationDuration: "4.1s" }}
        />
      </div>

      <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 ease-out transform hover:bg-white/10 animate-in fade-in duration-500">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-emerald-900/10 pointer-events-none" />

        <CardHeader className="text-center space-y-4 pt-6 pb-4 relative">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white leading-relaxed">
              Why did you download{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                Polarity
              </span>
              ?
            </CardTitle>
            <p className="text-slate-300 text-base font-medium">
              This helps us personalize your experience
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-6 relative">
          <div className="space-y-3">
            {reasons.map((reasonOption) => {
              const IconComponent = reasonOption.icon;
              const isSelected = selectedReasons.includes(reasonOption.value);

              return (
                <button
                  key={reasonOption.value}
                  type="button"
                  onClick={() => handleReasonToggle(reasonOption.value)}
                  className={`w-full p-4 text-left rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${
                    isSelected
                      ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-emerald-500/5 shadow-lg transform scale-[1.02] backdrop-blur-sm"
                      : "border-white/20 hover:border-emerald-400/30 hover:bg-white/5 shadow-sm"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-bold text-base transition-colors ${
                            isSelected
                              ? "text-white"
                              : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {reasonOption.label}
                        </h3>
                        {isSelected && (
                          <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-sm leading-relaxed transition-colors ${
                          isSelected
                            ? "text-slate-200"
                            : "text-slate-400 group-hover:text-slate-300"
                        }`}
                      >
                        {reasonOption.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
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
              onClick={onNext}
              disabled={selectedReasons.length === 0}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none rounded-2xl shadow-lg"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReasonSlide;
