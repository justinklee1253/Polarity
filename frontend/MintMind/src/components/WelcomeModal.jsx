import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, PiggyBank, Brain } from "lucide-react";

const WelcomeModal = ({ isOpen, onClose, userName = "there" }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-br from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-2">
            Welcome, {userName}! 👋
          </DialogTitle>
          <DialogDescription>
            This is a welcome message for new users.
          </DialogDescription>
          <p className="text-lg text-gray-600 font-medium">
            Meet <span className="text-sky-600 font-bold">Spark</span> – Your
            Smart Money Mentor
          </p>
        </DialogHeader>

        <div className="text-center space-y-6">
          <p className="text-gray-700 leading-relaxed text-base">
            I'm here to transform how you think about money as a college
            student. Let's build your financial future together! 🚀
          </p>

          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="flex items-start gap-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-100">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <PiggyBank className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sky-700 text-sm">
                  Smart Budgeting
                </h4>
                <p className="text-xs text-gray-600">
                  Create realistic budgets that actually work for student life
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-cyan-700 text-sm">
                  Investing & Saving
                </h4>
                <p className="text-xs text-gray-600">
                  Start building wealth early with student-friendly strategies
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 text-sm">
                  Wealth-Building Mindset
                </h4>
                <p className="text-xs text-gray-600">
                  Learn the money habits and strategies of successful people
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-500/10 to-cyan-500/10 rounded-xl p-4 border border-sky-200">
            <p className="text-sm text-gray-700 font-medium">
              <span className="text-sky-600">Personalized just for you</span> –
              I'll adapt my advice based on your goals, spending habits, and
              college lifestyle.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-600 hover:via-cyan-600 hover:to-blue-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Let's Build Your Financial Future ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
