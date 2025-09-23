import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { signup } from "@/services/auth";
import {
  Shield,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from "lucide-react";

function SignupModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationStatus, setValidationStatus] = useState({
    firstName: false,
    lastName: false,
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Form validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

    setValidationStatus({
      firstName: formData.firstName.trim().length >= 2,
      lastName: formData.lastName.trim().length >= 2,
      email: emailRegex.test(formData.email.trim()),
      username: formData.username.trim().length >= 3,
      password: passwordRegex.test(formData.password),
      confirmPassword:
        formData.password === formData.confirmPassword &&
        formData.confirmPassword.length > 0,
    });
  }, [formData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      };

      // console.log("Sending signup data:", {
      //   ...signupData,
      //   password: "[HIDDEN]",
      // });

      //API Call

      const { data } = await signup(signupData);

      toast({
        title: "Account created successfully!",
        description: "Welcome to Polarity! You're now signed in.",
      });

      // Reset sign up form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setCurrentStep(1);
      setFocusedField(null);

      onClose();
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "Something went wrong. Please try again.";

      if (error.message.includes("User already exists")) {
        errorMessage = "An account with this email or username already exists.";
      } else if (error.message.includes("Password must")) {
        errorMessage = error.message; // Show password validation errors directly
      } else if (Array.isArray(error.message)) {
        // Handle array of validation errors from backend
        errorMessage = error.message.join(". ");
      }

      toast({
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (
    field,
    type = "text",
    placeholder = "",
    icon = null
  ) => {
    const isPassword = type === "password";
    const isConfirmPassword = field === "confirmPassword";
    const showPasswordField =
      isPassword && field === "password"
        ? showPassword
        : isConfirmPassword
        ? showConfirmPassword
        : false;

    return (
      <div className="space-y-2">
        <Label
          htmlFor={field}
          className={`text-sm font-medium transition-all duration-300 flex items-center ${
            focusedField === field ? "text-emerald-400" : "text-slate-300"
          }`}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {field === "firstName"
            ? "First Name"
            : field === "lastName"
            ? "Last Name"
            : field === "email"
            ? "Email"
            : field === "username"
            ? "Username"
            : field === "password"
            ? "Password"
            : "Confirm Password"}
          {validationStatus[field] && (
            <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-400 animate-in fade-in duration-300" />
          )}
        </Label>
        <div className="relative" style={{ padding: "2px" }}>
          <Input
            id={field}
            name={field}
            type={isPassword ? (showPasswordField ? "text" : "password") : type}
            placeholder={placeholder}
            value={formData[field]}
            onChange={handleChange}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            required
            className={`h-10 bg-white/5 border transition-all duration-300 text-white placeholder:text-slate-400 rounded-lg ${
              isPassword ? "pr-12" : ""
            } ${
              focusedField === field
                ? "border-emerald-500/50 bg-white/10 shadow-lg shadow-emerald-500/20"
                : validationStatus[field]
                ? "border-emerald-500/30 bg-white/5"
                : "border-white/10 hover:border-white/20"
            }`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => {
                if (field === "password") setShowPassword(!showPassword);
                if (field === "confirmPassword")
                  setShowConfirmPassword(!showConfirmPassword);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-all duration-300 focus:outline-none hover:scale-110"
              tabIndex={-1}
            >
              {showPasswordField ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 pointer-events-none rounded-lg ${
              focusedField === field ? "opacity-100" : ""
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto overflow-x-visible backdrop-blur-2xl bg-slate-900/90 border border-white/10 shadow-2xl shadow-black/50 rounded-3xl">
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 group"
        >
          <X className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
        </button>

        <div className="relative z-10 p-6">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
              Join Polarity
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-1">
              Create your account and take control of your spending habits
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto overflow-x-visible">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Personal Info Step */}
              <div className="grid grid-cols-2 gap-3">
                {renderInputField(
                  "firstName",
                  "text",
                  "John",
                  <User className="w-4 h-4" />
                )}
                {renderInputField(
                  "lastName",
                  "text",
                  "Doe",
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Contact Info */}
              {renderInputField(
                "email",
                "email",
                "john.doe@university.edu",
                <Mail className="w-4 h-4" />
              )}
              {renderInputField(
                "username",
                "text",
                "johndoe",
                <User className="w-4 h-4" />
              )}

              {/* Security */}
              {renderInputField(
                "password",
                "password",
                "Create a secure password",
                <Lock className="w-4 h-4" />
              )}
              {renderInputField(
                "confirmPassword",
                "password",
                "Confirm your password",
                <Lock className="w-4 h-4" />
              )}

              {/* Password strength indicator */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">
                    Password strength:
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength =
                        formData.password.length >= 8 &&
                        /[A-Z]/.test(formData.password) &&
                        /[a-z]/.test(formData.password) &&
                        /\d/.test(formData.password)
                          ? 4
                          : formData.password.length >= 6 &&
                            (/[A-Z]/.test(formData.password) ||
                              /\d/.test(formData.password))
                          ? 3
                          : formData.password.length >= 4
                          ? 2
                          : formData.password.length > 0
                          ? 1
                          : 0;

                      return (
                        <div
                          key={level}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            level <= strength
                              ? strength >= 4
                                ? "bg-emerald-500"
                                : strength >= 3
                                ? "bg-yellow-500"
                                : strength >= 2
                                ? "bg-orange-500"
                                : "bg-red-500"
                              : "bg-white/10"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 rounded-lg mt-6 relative overflow-hidden group border-0"
                disabled={
                  isLoading || !Object.values(validationStatus).every(Boolean)
                }
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    Create Account
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-300">
              Already have an account?{" "}
              <button
                onClick={onClose}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Login instead
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignupModal;
