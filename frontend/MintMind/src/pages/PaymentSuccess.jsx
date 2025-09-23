import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import {
  CheckCircle2,
  Sparkles,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const email = searchParams.get("email") || "";
  const plan = searchParams.get("plan") || "lifetime";

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No payment session found",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
          }/waitlist/confirm-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to confirm payment");
        }

        setPaymentConfirmed(true);
        toast({
          title: "Payment Successful!",
          description: "Welcome to Polarity Early Access!",
        });
      } catch (error) {
        console.error("Payment confirmation error:", error);
        toast({
          title: "Payment Confirmation Error",
          description: error.message || "Failed to confirm payment",
          variant: "destructive",
        });
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId, navigate]);

  const handleGetStarted = () => {
    // Redirect to main app or login
    navigate("/auth");
  };

  if (isConfirming) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <StarsBackground />
        <ShootingStars />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-emerald-900/30" />

        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Confirming Payment...
          </h2>
          <p className="text-slate-300">
            Please wait while we process your payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Star Background */}
      <StarsBackground />

      {/* Shooting Stars */}
      <ShootingStars />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-emerald-900/30" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
              Polarity
            </h1>
          </div>
        </nav>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h2 className="text-5xl font-bold">
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  {plan === "lifetime"
                    ? "🎉 Welcome to Lifetime Access!"
                    : "🎉 Welcome to Early Access!"}
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Your payment was successful! You now have{" "}
                {plan === "lifetime" ? "lifetime" : "first month"} access to all
                Polarity features. Start taking control of your finances today.
              </p>
              {email && (
                <p className="text-emerald-400 font-medium">
                  Access granted to: {email}
                </p>
              )}
            </div>

            {/* Features Unlocked */}
            <div className="max-w-2xl mx-auto mt-16">
              <h3 className="text-2xl font-semibold text-white mb-8">
                🎉 What you've unlocked:
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center space-x-4 p-4 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-white font-medium">
                      Full Platform Access
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Connect your bank accounts and start tracking immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-white font-medium">
                      AI-Powered Insights
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Get personalized gambling detection and spending analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-white font-medium">Priority Support</h4>
                    <p className="text-slate-300 text-sm">
                      Direct access to our team for questions and feedback
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Crown className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-white font-medium">Lifetime Updates</h4>
                    <p className="text-slate-300 text-sm">
                      All future features and improvements included
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="pt-8">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] font-semibold border-0 text-lg h-14"
              >
                <div className="flex items-center space-x-3">
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">Polarity</span>
            </div>
            <div className="text-center text-slate-400 text-sm">
              © 2025 Polarity. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default PaymentSuccess;
