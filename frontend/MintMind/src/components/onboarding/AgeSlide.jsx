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
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          How old are you?
        </CardTitle>
        <p className="text-gray-600">
          This helps us provide age-appropriate financial advice
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium text-gray-700">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500 transition-colors text-lg text-center"
            min="1"
            max="120"
            autoFocus
          />
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
            onClick={handleNext}
            disabled={!isValidAge()}
            className="flex-1 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgeSlide;
