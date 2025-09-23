import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star } from "lucide-react";

const PersonalizedWelcomeSlide = ({ onNext, onPrev, data }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-6 left-12 w-3 h-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-20 right-8 w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-emerald-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s", animationDuration: "3s" }}
        />
        <div
          className="absolute bottom-16 left-4 w-4 h-4 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2.5s", animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-32 right-16 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "3.5s" }}
        />
      </div>

      <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 ease-out transform hover:bg-white/10 animate-in fade-in duration-500">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-emerald-900/10 pointer-events-none" />

        <CardHeader className="text-center space-y-4 pt-6 pb-4 relative">
          <div className="space-y-4">
            <CardTitle className="text-3xl font-bold text-white leading-relaxed">
              Hi, {data.name}! Welcome to{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                Polarity
              </span>
            </CardTitle>

            {/* Enhanced avatar with animation */}
            <div className="relative mx-auto w-fit">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 via-cyan-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
                <span className="text-white text-3xl font-bold z-10">
                  {data.name.charAt(0).toUpperCase()}
                </span>
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300 text-lg font-medium">
                Before we get started, let us get to know you better.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-6 relative">
          {/* Enhanced info card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-white/5 via-emerald-500/5 to-cyan-500/5 p-4 rounded-2xl border border-emerald-400/20 shadow-inner backdrop-blur-sm">
              <p className="text-slate-300 text-sm text-center font-medium">
                We'll create a personalized experience just for you
              </p>
            </div>
          </div>

          {/* Enhanced buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              onClick={onPrev}
              variant="outline"
              className="flex-1 h-14 border border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 transition-all duration-300 rounded-2xl font-semibold text-slate-300 hover:text-white shadow-sm hover:shadow-md bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={onNext}
              className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl rounded-2xl shadow-lg"
            >
              Let's Go!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedWelcomeSlide;
