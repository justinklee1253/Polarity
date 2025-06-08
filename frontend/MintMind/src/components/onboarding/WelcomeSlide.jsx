import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WelcomeSlide = ({ onNext, onDataUpdate, data }) => {
  const [name, setName] = useState(data.name);

  const handleNext = () => {
    if (name.trim()) {
      onDataUpdate({ name: name.trim() });
      onNext();
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Polarity
          </h1>
          <p className="text-gray-600">Smart budgeting for smart students</p>
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Hello! What's your name?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            First Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500 transition-colors text-lg"
            autoFocus
          />
        </div>

        <Button
          onClick={handleNext}
          disabled={!name.trim()}
          className="w-full h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeSlide;
