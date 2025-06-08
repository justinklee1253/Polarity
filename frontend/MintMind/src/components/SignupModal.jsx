import { useState } from "react";
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
  const navigate = useNavigate();

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

      console.log("Sending signup data:", {
        ...signupData,
        password: "[HIDDEN]",
      });

      //API Call
      const { data } = await apiService.signup(signupData);

      toast({
        title: "Account created successfully!",
        description: "Welcome to Polarity! You're now signed in.",
      });

      //Reset sign up form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      });

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
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center bg-gradient-to-r from-sky-200 to-cyan-200 bg-clip-text text-transparent">
            Join Polarity
          </DialogTitle>
          <DialogDescription className="text-center text-sky-100/70">
            Create your account and start managing your finances smarter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSignup} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-sky-100"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:ring-sky-400 backdrop-blur-sm transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-sky-100"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:ring-sky-400 backdrop-blur-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-sky-100">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-10 border-white/20 bg-white/10 text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:ring-sky-400 backdrop-blur-sm transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-sky-100"
            >
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              className="h-10 border-white/20 bg-white/10 text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:ring-sky-400 backdrop-blur-sm transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-sky-100"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-10 border-white/20 bg-white/10 text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:ring-sky-400 backdrop-blur-sm transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-sky-100"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="h-10 border-white/20 bg-white/10 text-white placeholder:text-sky-100/50 focus:border-sky-400 focus:ring-sky-400 backdrop-blur-sm transition-colors"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/25 mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-sky-100/70">
            Already have an account?{" "}
            <button
              onClick={onClose}
              className="text-sky-300 hover:text-sky-200 font-medium hover:underline transition-colors"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignupModal;
