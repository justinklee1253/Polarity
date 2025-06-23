import { useState, useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import WelcomeSlide from "@/components/onboarding/WelcomeSlide";
import PersonalizedWelcomeSlide from "@/components/onboarding/PersonalizedWelcomeSlide";
import AgeSlide from "@/components/onboarding/AgeSlide";
import CollegeSlide from "@/components/onboarding/CollegeSlide";
import ReasonSlide from "@/components/onboarding/ReasonSlide";
import FinancialSlide from "@/components/onboarding/FinancialSlide";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

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

  // On mount, fetch onboarding status and set step
  useEffect(() => {
    apiService.getOnboardingStatus().then(({ data }) => {
      if (data.onboarding_completed) {
        navigate("/dashboard");
      } else if (typeof data.current_step === "number") {
        setCurrentStep(data.current_step);
      }
    });
  }, [navigate]);

  // Helper to map frontend data to backend expected fields
  const mapDataForBackend = () => {
    return {
      name: onboardingData.name,
      age: onboardingData.age,
      is_student: onboardingData.isCollegeStudent,
      college_name: onboardingData.college,
      financial_goals: onboardingData.reason ? [onboardingData.reason] : [],
      salary_monthly: onboardingData.monthlySalary,
      monthly_spending_goal: onboardingData.monthlySpendingGoal,
      total_balance: onboardingData.currentBalance,
    };
  };
  const nextStep = async (immediateData = null) => {
    // Save current step to backend before moving to next
    try {
      // Map step index to backend step (1-based)
      const backendStep = currentStep + 1;
      // Only send relevant data for each step
      let dataToSend = {};
      if (backendStep === 1) {
        dataToSend = { name: onboardingData.name };
      } else if (backendStep === 2) {
        dataToSend = {}; // no-op
      } else if (backendStep === 3) {
        // Use immediate data if provided, otherwise use state
        const ageValue = immediateData?.age || onboardingData.age;
        if (!ageValue) {
          console.error(
            "Age is missing. immediateData:",
            immediateData,
            "onboardingData:",
            onboardingData
          );
          throw new Error("Age is required");
        }
        dataToSend = { age: ageValue };
      } else if (backendStep === 4) {
        dataToSend = {
          is_student: onboardingData.isCollegeStudent,
          college_name: onboardingData.isCollegeStudent
            ? onboardingData.college
            : null,
        };
      } else if (backendStep === 5) {
        dataToSend = {
          financial_goals: onboardingData.reason ? [onboardingData.reason] : [],
        };
      } else if (backendStep === 6) {
        dataToSend = {
          salary_monthly: onboardingData.monthlySalary,
          monthly_spending_goal: onboardingData.monthlySpendingGoal,
          total_balance: onboardingData.currentBalance,
        };
      }
      if (backendStep <= 6) {
        console.log(
          "Sending to backend - Step:",
          backendStep,
          "Data:",
          dataToSend
        );
        await apiService.updateOnboardingStep(backendStep, dataToSend);
      }
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      console.error("nextStep error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save onboarding step",
      });
    }
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const updateData = (newData) => {
    setOnboardingData((prev) => ({ ...prev, ...newData }));
  };

  const completeOnboarding = async () => {
    try {
      // Save the last step (step 6)
      await apiService.updateOnboardingStep(6, {
        salary_monthly: onboardingData.monthlySalary,
        monthly_spending_goal: onboardingData.monthlySpendingGoal,
        total_balance: onboardingData.currentBalance,
      });
      // Mark onboarding as complete
      await apiService.completeOnboarding();
      toast({
        title: "Welcome to Polarity!",
        description: "Your account has been set up successfully.",
      });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to complete onboarding",
      });
    }
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
          setCurrentStep(6);
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
            {[0, 1, 2, 3, 4, 5, 6].map((step) => {
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
