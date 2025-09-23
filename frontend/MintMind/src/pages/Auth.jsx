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
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  ArrowRight,
  Sparkles,
  PiggyBank,
  BarChart3,
  Target,
} from "lucide-react";
// Import images from assets
import plaidImg from "@/assets/images/plaidboo2.png";
import openaiImg from "@/assets/images/openai-icon.png";
import trans2Img from "@/assets/images/trans2.png";
import gspendImg from "@/assets/images/gspend.png";

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

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailSignup, setEmailSignup] = useState("");

  const handleEmailSignup = (e) => {
    e.preventDefault();
    if (emailSignup) {
      toast({
        title: "Thank you!",
        description: "We'll keep you updated on our progress.",
      });
      setEmailSignup("");
    }
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

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
              Polarity
            </h1>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="relative text-white font-medium px-6 py-2.5 transition-all duration-300 group"
          >
            Login
            <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8"></div>
          </button>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                  Quit Sports-Betting &{" "}
                </span>
                <span className="bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                  Gambling{" "}
                </span>
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                  in 30 days.
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Track your gambling losses & spend, stay in control, and build
                better habits with AI-powered insights that understand your
                spending patterns.
              </p>
            </div>

            {/* Waitlist Signup Form */}
            <div className="max-w-lg mx-auto">
              <form
                onSubmit={handleEmailSignup}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailSignup}
                  onChange={(e) => setEmailSignup(e.target.value)}
                  className="flex-1 h-14 bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded-lg backdrop-blur-sm focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all text-lg px-6"
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 h-14 rounded-lg transition-all duration-300 transform hover:scale-[1.02] font-semibold border-0 text-lg whitespace-nowrap"
                >
                  Join Waitlist!
                </Button>
              </form>
            </div>

            {/* Powered by section */}
            <div className="pt-12">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-4">Powered by</p>
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex items-center space-x-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                    <img
                      src={plaidImg}
                      alt="Plaid"
                      className="h-8 w-auto"
                      style={{
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                    <span className="text-slate-400 font-medium">Plaid</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                    <img
                      src={openaiImg}
                      alt="OpenAI"
                      className="h-8 w-auto"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                    <span className="text-slate-400 font-medium">OpenAI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Demo Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            {/* <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              Product Demo
            </div> */}
            <h3 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
                See Polarity in action
              </span>
            </h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto"></p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo 1: Plaid Integration */}
            <div className="group animate-in slide-in-from-left duration-700 delay-200">
              <div className="relative">
                {/* Glowing background effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Demo card */}
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-emerald-500/10">
                  {/* Demo image */}
                  <div className="relative overflow-hidden rounded-2xl mb-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
                    <img
                      src={trans2Img}
                      alt="Plaid Integration Demo"
                      className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    {/* Fallback placeholder */}
                    <div
                      className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-dashed border-emerald-500/30"
                      style={{ display: "none" }}
                    >
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-emerald-400 font-medium">
                          Plaid Integration
                        </p>
                        <p className="text-slate-400 text-sm">
                          Secure bank connection
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white">
                        Secure Bank Synchronization
                      </h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Connect your bank account securely with Plaid. Your
                      financial data is encrypted and protected with bank-level
                      security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo 2: Gambling Dashboard */}
            <div className="group animate-in slide-in-from-right duration-700 delay-400">
              <div className="relative">
                {/* Glowing background effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Demo card */}
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                  {/* Demo image */}
                  <div className="relative overflow-hidden rounded-2xl mb-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
                    <img
                      src={gspendImg}
                      alt="Gambling Dashboard Demo"
                      className="w-full h-80 object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    {/* Fallback placeholder */}
                    <div
                      className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border-2 border-dashed border-cyan-500/30"
                      style={{ display: "none" }}
                    >
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                        <p className="text-cyan-400 font-medium">
                          Gambling Dashboard
                        </p>
                        <p className="text-slate-400 text-sm">
                          Real-time spend tracking
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white">
                        Track your total gambling spend in real time
                      </h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Monitor your total gambling spend in real time with
                      detailed breakdowns, budget progress, and transaction
                      history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional CTA Section */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to take control?
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already transformed their
              relationship with money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setShowSignup(true)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-3.5 text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20 group border-0"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="relative text-white font-medium px-8 py-3.5 text-lg transition-all duration-300 group"
              >
                Already have an account? Login
                <div className="absolute bottom-2 left-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-3/4 group-hover:left-1/8"></div>
              </button>
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
            <div className="flex space-x-8 text-slate-400 text-sm">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="text-center text-slate-400 text-sm mt-8">
            © 2025 Polarity. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Glassmorphism Card */}
            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
              <CardHeader className="space-y-1 p-8">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-3xl font-semibold text-white">
                    Welcome back
                  </CardTitle>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <CardDescription className="text-slate-300 text-lg">
                  Login to your account to continue
                </CardDescription>
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
                        className={`h-12 bg-white/5 border transition-all duration-300 text-white placeholder:text-slate-400 rounded-lg ${
                          focusedField === "email"
                            ? "border-emerald-500/50 shadow-lg shadow-emerald-500/25 bg-white/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      />
                      <div
                        className={`absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
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
                        className={`h-12 bg-white/5 border transition-all duration-300 text-white placeholder:text-slate-400 rounded-lg pr-12 ${
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
                        className={`absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
                          focusedField === "password" ? "opacity-100" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 rounded-lg mt-8 relative overflow-hidden group border-0"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <span className="relative z-10">Login</span>
                    )}
                  </Button>
                </form>

                {/* Sign up link */}
                <div className="mt-8 text-center">
                  <p className="text-slate-300">
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowSignup(true);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      Create one!
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
}

export default Auth;
