import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PersonalizedWelcomeSlide = ({ onNext, onPrev, data }) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Hi, {data.name}! Welcome to Polarity
        </CardTitle>
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {data.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Before we get started, let me get to know you better.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-4 rounded-lg border border-sky-100">
          <p className="text-gray-700 text-sm text-center">
            This will help us personalize your budgeting experience and provide
            better financial insights.
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
            onClick={onNext}
            className="flex-1 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            Let's Go!
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedWelcomeSlide;
