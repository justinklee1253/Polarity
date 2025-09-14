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

const WelcomeModal = ({ isOpen, onClose, userName = "Student" }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-slate-900/95 border border-white/10 shadow-2xl shadow-black/20 text-white">
        <DialogHeader className="text-center space-y-4">
          <div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
              Welcome, {userName}!
            </DialogTitle>
            <p className="text-slate-300 mt-2">
              Meet <span className="text-emerald-400 font-semibold">Spark</span>{" "}
              – Your Smart Money Mentor
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-slate-300 text-center leading-relaxed">
            I'm here to transform how you think about money as a college
            student. Let's build your financial future together!
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10 hover:border-emerald-500/30 transition-colors duration-300">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <PiggyBank className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-400 text-sm">
                  Smart Budgeting
                </h4>
                <p className="text-xs text-slate-400">
                  Create realistic budgets that actually work for student life
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10 hover:border-cyan-500/30 transition-colors duration-300">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-medium text-cyan-400 text-sm">
                  Investing & Saving
                </h4>
                <p className="text-xs text-slate-400">
                  Start building wealth early with student-friendly strategies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10 hover:border-emerald-500/30 transition-colors duration-300">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-400 text-sm">
                  Wealth-Building Mindset
                </h4>
                <p className="text-xs text-slate-400">
                  Learn the money habits and strategies of successful people
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-sm text-slate-300 text-center">
              <span className="text-emerald-400 font-medium">
                Personalized just for you
              </span>{" "}
              – I'll adapt my advice based on your goals, spending habits, and
              college lifestyle.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium py-3 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] border-0"
          >
            Let's Build Your Financial Future
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
