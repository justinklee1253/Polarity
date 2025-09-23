import { useState, useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import WelcomeSlide from "@/components/onboarding/WelcomeSlide";
import PersonalizedWelcomeSlide from "@/components/onboarding/PersonalizedWelcomeSlide";
import AgeSlide from "@/components/onboarding/AgeSlide";
import CollegeSlide from "@/components/onboarding/CollegeSlide";
import ReasonSlide from "@/components/onboarding/ReasonSlide";
import FinancialSlide from "@/components/onboarding/FinancialSlide";
import { toast } from "@/hooks/use-toast";
import {
  updateOnboardingStep,
  getOnboardingStatus,
  checkOnboardingCompletion,
} from "@/services/onboarding";
import { apiService } from "@/services/api";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    name: "",
    age: null,
    isCollegeStudent: null,
    college: "",
    reasons: [],
    monthlySalary: null,
    monthlySpendingGoal: null,
    // currentBalance: null handled by plaid
  });
  const navigate = useNavigate(); //react router hook to navigate to different pages.

  // On mount, fetch onboarding status and set step and data
  useEffect(() => {
    getOnboardingStatus().then(({ data }) => {
      //destructure data from response from /onboarding/status route.
      if (data.onboarding_completed) {
        navigate("/dashboard");
      } else if (typeof data.current_step === "number") {
        setCurrentStep(data.current_step);
        // Pre-populate onboardingData from backend user_data if available
        if (data.user_data) {
          setOnboardingData({
            name: data.user_data.name || "",
            age: data.user_data.age ?? null,
            isCollegeStudent: data.user_data.is_student ?? null,
            college: data.user_data.college_name || "",
            reasons: Array.isArray(data.user_data.financial_goals)
              ? data.user_data.financial_goals
              : [],
            monthlySalary: data.user_data.salary_monthly ?? null,
            monthlySpendingGoal: data.user_data.monthly_spending_goal ?? null,
            // currentBalance: data.user_data.total_balance ?? null,
          });
        }
      }
    });
  }, [navigate]);

  // Add effect to check onboarding completion status periodically
  useEffect(() => {
    let interval;
    if (currentStep >= 5 && !isCompleting) {
      interval = setInterval(async () => {
        try {
          const { data } = await getOnboardingStatus();
          if (data.onboarding_completed) {
            setIsCompleting(true);
            clearInterval(interval);
            toast({
              title: "Welcome to Polarity!",
              description: "Your account has been set up successfully.",
            });
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      }, 5000); // Check every 5 seconds (less aggressive since most cases use immediate completion)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, isCompleting, navigate]);

  // Helper to map frontend data to backend expected fields
  const mapDataForBackend = () => {
    return {
      name: onboardingData.name,
      age: onboardingData.age,
      is_student: onboardingData.isCollegeStudent,
      college_name: onboardingData.college,
      financial_goals: Array.isArray(onboardingData.reasons)
        ? onboardingData.reasons
        : [],
      salary_monthly: onboardingData.monthlySalary,
      monthly_spending_goal: onboardingData.monthlySpendingGoal,
      // total_balance: onboardingData.currentBalance,
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
          financial_goals: Array.isArray(onboardingData.reasons)
            ? onboardingData.reasons
            : [],
        };
      } else if (backendStep === 6) {
        dataToSend = {
          salary_monthly: onboardingData.monthlySalary,
          monthly_spending_goal: onboardingData.monthlySpendingGoal,
          // total_balance: onboardingData.currentBalance,
        };
      }
      if (backendStep <= 6) {
        await updateOnboardingStep(backendStep, dataToSend);
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

  const handleOnboardingComplete = async (immediateComplete = false) => {
    if (isCompleting) return;

    try {
      setIsCompleting(true);

      // If immediate completion (from Plaid), skip saving step data and checking
      if (immediateComplete) {
        toast({
          title: "Welcome to Polarity!",
          description: "Your account has been set up successfully.",
        });
        navigate("/dashboard");
        return;
      }

      // Save the final step data
      await updateOnboardingStep(6, {
        salary_monthly: onboardingData.monthlySalary,
        monthly_spending_goal: onboardingData.monthlySpendingGoal,
      });

      // Call webhook to check onboarding completion
      const response = await checkOnboardingCompletion();
      if (response.data.onboarding_completed) {
        toast({
          title: "Welcome to Polarity!",
          description: "Your account has been set up successfully.",
        });
        navigate("/dashboard");
      } else {
        // Not complete yet (maybe Plaid not connected), let polling continue
        setIsCompleting(false);
      }
    } catch (err) {
      setIsCompleting(false);
      toast({
        title: "Error",
        description: err.message || "Failed to complete onboarding",
      });
    }
  };

  // Add this effect to handle skipping the reason slide
  useEffect(() => {
    if (currentStep === 4 && onboardingData.isCollegeStudent === false) {
      setCurrentStep(6);
    }
  }, [currentStep, onboardingData.isCollegeStudent]);

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
        return (
          <ReasonSlide
            onNext={nextStep}
            onPrev={prevStep}
            onDataUpdate={updateData}
            data={onboardingData}
          />
        );
      case 5:
      case 6:
        // Only render FinancialSlide if not completing
        if (isCompleting) {
          return (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Setting up your account...</p>
            </div>
          );
        }
        return (
          <FinancialSlide
            onComplete={handleOnboardingComplete}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background with floating particles */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-40 right-32 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s", animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-32 left-32 w-5 h-5 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2.5s", animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-20 right-20 w-4 h-4 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "4.5s" }}
        />

        {/* Subtle geometric shapes */}
        <div
          className="absolute top-16 right-16 w-16 h-16 border border-emerald-500/10 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute bottom-16 left-16 w-12 h-12 border border-cyan-500/10 rounded-lg rotate-45 animate-pulse"
          style={{ animationDuration: "3s" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Progress indicator */}
        <div className="mb-12">
          <div className="flex justify-center space-x-3">
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
                  className={`h-3 w-10 rounded-full transition-all duration-500 ease-out shadow-sm ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg transform scale-105"
                      : "bg-slate-700/60 backdrop-blur-sm"
                  }`}
                />
              );
            })}
          </div>

          {/* Progress percentage */}
          <div className="mt-4 text-center">
            <span className="text-sm font-medium text-slate-300 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-400/20">
              Step {currentStep + 1} of{" "}
              {onboardingData.isCollegeStudent === false && currentStep > 3
                ? 6
                : 7}
            </span>
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
