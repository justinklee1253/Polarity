import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { getCurrentUser } from "@/services/auth";
import { Loader2 } from "lucide-react";

const PaymentGate = ({ children, requirePayment = true }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to get user:", error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  const paymentStatus = usePaymentStatus(user?.email);

  useEffect(() => {
    if (!requirePayment) return;

    if (!userLoading && !paymentStatus.loading) {
      // If user exists and we need to check payment status
      if (user?.email && !paymentStatus.paid) {
        // User hasn't paid, redirect to paywall
        navigate(
          `/thank-you?email=${encodeURIComponent(user.email)}&showPaywall=true`
        );
        return;
      }

      // If no user email, might need to handle differently
      if (!user?.email) {
        // Could redirect to auth or handle as needed
        console.warn("No user email found for payment check");
      }
    }
  }, [user, paymentStatus, userLoading, requirePayment, navigate]);

  // Show loading while checking user and payment status
  if (userLoading || (requirePayment && paymentStatus.loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Checking access...</p>
        </div>
      </div>
    );
  }

  // If payment is required but user hasn't paid, don't render children
  // (the useEffect above will handle the redirect)
  if (requirePayment && user?.email && !paymentStatus.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Redirecting to payment...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error checking payment status
  if (paymentStatus.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error checking payment status</p>
          <button
            onClick={() => window.location.reload()}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // If we get here, either payment is not required or user has paid
  return children;
};

export default PaymentGate;
