import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import SignupModal from "@/components/SignupModal";
import { login } from "@/services/auth";
import { Eye, EyeOff, Shield, CheckCircle2, Lock } from "lucide-react";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isValid, setIsValid] = useState({ email: false, password: false });
  const navigate = useNavigate();

  // Animated background particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  // Form validation
  useEffect(() => {
    setIsValid({
      email: email.length > 0,
      password: password.length > 0,
    });
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const credentials = {
        [email.includes("@") ? "email" : "username"]: email.trim(), //if an email contains an @ symbol, we want to treat it as an email, otherwise treat it as a username.
        password: password,
      };

      const result = await login(credentials); //abstracted away logic for login from auth.js

      // // **UNCOMMENT FOR DEBUGGING**: Log the full result to see what login returns
      // console.log("Login result:", result);
      // console.log("Login result.data:", result.data);
      // console.log("Login result.response:", result.response);

      // Extract onboarding status from login response
      const { onboarding_completed, onboarding_step } = result.data;

      toast({
        title: "Login successful!",
        description: "Welcome back to Polarity!",
      });

      // Navigate based on onboarding status
      if (!onboarding_completed) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVis = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-emerald-900/30" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-10 w-32 h-32 border border-emerald-500/10 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-24 h-24 border border-cyan-500/10 rounded-lg animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <div className="absolute top-1/2 left-5 w-16 h-16 border border-emerald-400/10 rotate-45 animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent animate-pulse">
              Polarity
            </h1>
            <p className="text-slate-300 text-lg font-light">
              Smart budgeting for smart students
            </p>
          </div>

          {/* Glassmorphism Card */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 p-8">
              <CardTitle className="text-3xl font-semibold text-center text-white">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-slate-300 text-lg">
                Sign in to your account to continue
              </CardDescription>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 pt-4">
                <div className="flex items-center space-x-2 text-emerald-400 text-sm"></div>
                <div className="flex items-center space-x-2 text-cyan-400 text-sm"></div>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className={`text-sm font-medium transition-all duration-300 ${
                      focusedField === "email"
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }`}
                  >
                    Email or Username
                    {isValid.email && (
                      <CheckCircle2 className="inline w-4 h-4 ml-2 text-emerald-400 animate-in fade-in duration-300" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-12 bg-white/5 border transition-all duration-300 text-white placeholder:text-slate-400 rounded-xl ${
                        focusedField === "email"
                          ? "border-emerald-500/50 shadow-lg shadow-emerald-500/25 bg-white/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
                        focusedField === "email" ? "opacity-100" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="password"
                    className={`text-sm font-medium transition-all duration-300 ${
                      focusedField === "password"
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }`}
                  >
                    Password
                    {isValid.password && (
                      <CheckCircle2 className="inline w-4 h-4 ml-2 text-emerald-400 animate-in fade-in duration-300" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-12 bg-white/5 border transition-all duration-300 text-white placeholder:text-slate-400 rounded-xl pr-12 ${
                        focusedField === "password"
                          ? "border-emerald-500/50 shadow-lg shadow-emerald-500/25 bg-white/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVis}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-all duration-300 focus:outline-none hover:scale-110"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
                        focusedField === "password" ? "opacity-100" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 rounded-xl mt-8 relative overflow-hidden group"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="relative z-10">Sign In</span>
                  )}
                </Button>
              </form>

              {/* Sign up link */}
              <div className="mt-8 text-center">
                <p className="text-slate-300">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowSignup(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-300 transform hover:scale-105 inline-block"
                  >
                    Sign up!
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>

      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
}

export default Auth;
