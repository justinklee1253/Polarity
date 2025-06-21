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
    return <div>Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;
