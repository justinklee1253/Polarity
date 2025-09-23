import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgeSlide = ({ onNext, onPrev, onDataUpdate, data }) => {
  const [age, setAge] = useState(data.age?.toString() || "");

  const handleNext = () => {
    const ageNum = parseInt(age);
    if (ageNum && ageNum > 0 && ageNum < 120) {
      onDataUpdate({ age: ageNum });
      onNext({ age: ageNum });
    }
  };

  const isValidAge = () => {
    const ageNum = parseInt(age);
    return ageNum && ageNum > 0 && ageNum < 120;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-8 left-6 w-3 h-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.2s", animationDuration: "3.5s" }}
        />
        <div
          className="absolute top-24 right-10 w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-emerald-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1.2s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-24 left-8 w-4 h-4 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "4.5s" }}
        />
        <div
          className="absolute bottom-8 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "0.8s", animationDuration: "3s" }}
        />
      </div>

      <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 ease-out transform hover:bg-white/10 animate-in fade-in duration-500">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-emerald-900/10 pointer-events-none" />

        <CardHeader className="text-center space-y-4 pt-6 pb-4 relative">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white leading-relaxed">
              How old are you?
            </CardTitle>
            <p className="text-slate-300 text-base font-medium">
              This helps us provide age-appropriate financial advice
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-6 relative">
          <div className="space-y-4">
            <Label
              htmlFor="age"
              className="text-base font-semibold text-slate-200 text-center block"
            >
              Your Age
            </Label>

            <div className="relative max-w-xs mx-auto">
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-14 border border-white/20 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 text-xl text-center rounded-2xl bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md font-semibold text-white placeholder:text-slate-400"
                min="1"
                max="120"
                autoFocus
              />
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
              onClick={handleNext}
              disabled={!isValidAge()}
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

export default AgeSlide;
