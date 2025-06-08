import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeSlide from "@/components/onboarding/WelcomeSlide";
import PersonalizedWelcomeSlide from "@/components/onboarding/PersonalizedWelcomeSlide";
import AgeSlide from "@/components/onboarding/AgeSlide";
import CollegeSlide from "@/components/onboarding/CollegeSlide";
import ReasonSlide from "@/components/onboarding/ReasonSlide";
import FinancialSlide from "@/components/onboarding/FinancialSlide";
import { toast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    name: "",
    age: null,
    isCollegeStudent: null,
    college: "",
    reason: "",
    monthlySalary: null,
    monthlySpendingGoal: null,
    currentBalance: null,
  });
  const navigate = useNavigate();

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const updateData = (newData) => {
    setOnboardingData((prev) => ({ ...prev, ...newData }));
  };

  const completeOnboarding = () => {
    console.log("Onboarding completed with data:", onboardingData);
    toast({
      title: "Welcome to Polarity!",
      description: "Your account has been set up successfully.",
    });
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeSlide
            onNext={nextStep}
            onDataUpdate={updateData}
            data={onboardingData}
          />
        );
      case 1:
        return (
          <PersonalizedWelcomeSlide
            onNext={nextStep}
            onPrev={prevStep}
            data={onboardingData}
          />
        );
      case 2:
        return (
          <AgeSlide
            onNext={nextStep}
            onPrev={prevStep}
            onDataUpdate={updateData}
            data={onboardingData}
          />
        );
      case 3:
        return (
          <CollegeSlide
            onNext={nextStep}
            onPrev={prevStep}
            onDataUpdate={updateData}
            data={onboardingData}
          />
        );
      case 4:
        if (onboardingData.isCollegeStudent) {
          return (
            <ReasonSlide
              onNext={nextStep}
              onPrev={prevStep}
              onDataUpdate={updateData}
              data={onboardingData}
            />
          );
        } else {
          // Skip reason slide if not a college student
          setCurrentStep(5);
          return null;
        }
      case 5:
        return (
          <FinancialSlide
            onComplete={completeOnboarding}
            onPrev={prevStep}
            onDataUpdate={updateData}
            data={onboardingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((step) => {
              // Skip step 4 indicator if not a college student
              if (
                step === 4 &&
                !onboardingData.isCollegeStudent &&
                currentStep > 3
              ) {
                return null;
              }
              return (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500"
                      : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
