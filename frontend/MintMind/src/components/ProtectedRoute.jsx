import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

const ProtectedRoute = ({ children, requireOnboardingComplete = false }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await apiService.getCurrentUser();
        if (!data) {
          navigate("/auth");
          return;
        }
        if (requireOnboardingComplete && !data.onboarding_completed) {
          navigate("/onboarding");
          return;
        }
        if (!requireOnboardingComplete && data.onboarding_completed) {
          navigate("/dashboard");
          return;
        }
        setLoading(false);
      } catch (error) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate, requireOnboardingComplete]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
