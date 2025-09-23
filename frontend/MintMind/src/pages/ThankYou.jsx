import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Sparkles,
  Crown,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function ThankYou() {
  const [searchParams] = useSearchParams();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const showPaywall = searchParams.get("showPaywall") === "true";

  // Show payment modal after 3 seconds or immediately if showPaywall is true
  useEffect(() => {
    if (showPaywall) {
      setShowPaymentModal(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowPaymentModal(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showPaywall]);

  const handleCreateCheckoutSession = async (planType = "lifetime") => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email is required for payment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        planType === "monthly"
          ? "/waitlist/create-monthly-checkout-session"
          : "/waitlist/create-checkout-session";

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
        }${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <button
            onClick={() => navigate("/")}
            className="relative text-white font-medium px-6 py-2.5 transition-all duration-300 group"
          >
            Back to Home
            <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8"></div>
          </button>
        </nav>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h2 className="text-5xl font-bold">
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  You're on the list!
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Thank you for joining our waitlist. We'll keep you updated on
                our progress and notify you as soon as Polarity is ready to help
                you take control of your finances.
              </p>
              {email && (
                <p className="text-emerald-400 font-medium">
                  Confirmation sent to: {email}
                </p>
              )}
            </div>

            {/* What's Next Section */}
            <div className="max-w-2xl mx-auto mt-16">
              <h3 className="text-2xl font-semibold text-white mb-6">
                What happens next?
              </h3>
              <div className="grid gap-4 text-left">
                <div className="flex items-start space-x-4 p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-400 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Development Updates
                    </h4>
                    <p className="text-slate-300 text-sm">
                      We'll send you regular updates on our progress and new
                      features.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-400 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Early Access</h4>
                    <p className="text-slate-300 text-sm">
                      Get first access to Polarity before the public launch.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-400 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Exclusive Benefits
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Special pricing and features for early supporters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Early Access Button */}
              <div className="text-center mt-8">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] font-semibold border-0 text-lg h-12"
                >
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5" />
                    <span>Get Early Access</span>
                  </div>
                </Button>
                <p className="text-slate-400 text-sm mt-2">
                  Special pricing for waitlist members
                </p>
              </div>
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

      {/* Early Access Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="backdrop-blur-xl bg-slate-900/95 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 rounded-2xl max-w-3xl p-0 overflow-hidden">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-3 z-10 text-slate-400 hover:text-red-400 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 rounded-full p-1 hover:bg-red-500/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 p-6 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold text-white mb-1">
                  🎉 Special Early Supporter Offer
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Limited time pricing for waitlist members
                </DialogDescription>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Lifetime Plan */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/30 rounded-xl p-5 relative group hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        Lifetime Access
                      </h3>
                      <div className="mb-3">
                        <div className="text-3xl font-bold text-white">
                          <span className="text-lg text-slate-400 line-through mr-2">
                            $120
                          </span>
                          $9.99
                        </div>
                        <p className="text-emerald-400 font-medium text-xs">
                          One-time • 92% off
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4 h-16">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Crown className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs">Lifetime subscription</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs">Build process insights</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs">Direct feature requests</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCreateCheckoutSession("lifetime")}
                      disabled={isLoading}
                      className="w-full h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] rounded-lg border-0 text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Get Lifetime Access</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Monthly Plan */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 relative group hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        First Month
                      </h3>
                      <div className="mb-3">
                        <div className="text-3xl font-bold text-white">
                          <span className="text-lg text-slate-400 line-through mr-2">
                            $9.99
                          </span>
                          $1.99
                        </div>
                        <p className="text-cyan-400 font-medium text-xs">
                          First month • 80% off
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4 h-16">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="text-xs">
                          Exclusive early beta access
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCreateCheckoutSession("monthly")}
                      disabled={isLoading}
                      className="w-full h-10 bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] rounded-lg border border-white/20 text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Try First Month</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                🔒 Secure Stripe Payment • 30-day refund guarantee
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ThankYou;
