import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const WelcomeSlide = ({ onNext, onDataUpdate, data }) => {
  const handleInputChange = (e) => {
    onDataUpdate({ name: e.target.value });
  };

  const handleNext = () => {
    if (data.name && data.name.trim()) {
      onNext();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-4 left-8 w-3 h-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-16 right-12 w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-emerald-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-20 left-6 w-4 h-4 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-8 right-8 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
        />
      </div>

      <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 ease-out transform hover:bg-white/10 animate-in fade-in duration-500">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-emerald-900/10 pointer-events-none" />

        <CardHeader className="text-center space-y-6 pt-8 pb-4 relative">
          <div className="space-y-4">
            {/* Brand with icon */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                Polarity
              </h1>
            </div>
            <p className="text-slate-300 font-medium tracking-wide">
              Smart budgeting for smart students
            </p>
          </div>

          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white leading-relaxed">
              Hello! What's your name?
            </CardTitle>
            <p className="text-slate-300 text-lg">
              Let's start your journey to financial wellness
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8 relative">
          <div className="space-y-4">
            <Label
              htmlFor="name"
              className="text-base font-semibold text-slate-200"
            >
              First Name
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Enter your first name"
                value={data.name}
                onChange={handleInputChange}
                className="h-14 border border-white/20 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 text-lg rounded-2xl bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md pl-4 pr-4 text-white placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleNext}
              disabled={!data.name || !data.name.trim()}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none rounded-2xl shadow-lg"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeSlide;
