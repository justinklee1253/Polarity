import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Spark from "./pages/Spark";
import PlanBudget from "./pages/PlanBudget";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Reset from "./pages/Reset";
import EditProfile from "./pages/EditProfile";
// import Demo from "./pages/Demo";
import ThankYou from "./pages/ThankYou";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentGate from "./components/PaymentGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireOnboardingComplete={true}>
                <PaymentGate requirePayment={true}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PaymentGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/spark"
            element={
              <ProtectedRoute requireOnboardingComplete={true}>
                <PaymentGate requirePayment={true}>
                  <Layout>
                    <Spark />
                  </Layout>
                </PaymentGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan-budget"
            element={
              <ProtectedRoute requireOnboardingComplete={true}>
                <PaymentGate requirePayment={true}>
                  <Layout>
                    <PlanBudget />
                  </Layout>
                </PaymentGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboardingComplete={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset"
            element={
              <ProtectedRoute requireOnboardingComplete={true}>
                <Reset />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute requireOnboardingComplete={true}>
                <PaymentGate requirePayment={true}>
                  <Layout>
                    <EditProfile />
                  </Layout>
                </PaymentGate>
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
