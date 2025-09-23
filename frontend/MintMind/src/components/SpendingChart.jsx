import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const SpendingChart = ({ chartData, summary, loading = false }) => {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animation effect
  useEffect(() => {
    if (loading) return;

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOutCubic);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [loading, chartData]);

  // Draw the chart
  useEffect(() => {
    if (!chartData || !canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max values for scaling
    const maxTotal = Math.max(...chartData.map((d) => d.total_spending));
    const maxGambling = Math.max(...chartData.map((d) => d.gambling_spending));
    const maxValue = Math.max(maxTotal, maxGambling);

    // Create gradient for total spending line
    const totalGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    totalGradient.addColorStop(0, "rgba(20, 184, 166, 0.3)"); // teal-500 with opacity
    totalGradient.addColorStop(1, "rgba(20, 184, 166, 0.05)");

    // Create gradient for gambling spending line
    const gamblingGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gamblingGradient.addColorStop(0, "rgba(239, 68, 68, 0.3)"); // red-500 with opacity
    gamblingGradient.addColorStop(1, "rgba(239, 68, 68, 0.05)");

    // Draw grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines (month markers)
    const monthInterval = Math.floor(chartData.length / 3);
    for (let i = 0; i <= 3; i++) {
      const x = padding.left + (chartWidth / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    // Draw area under total spending line
    ctx.fillStyle = totalGradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);

    chartData.forEach((point, index) => {
      const x =
        padding.left +
        (chartWidth / (chartData.length - 1)) * index * animationProgress;
      const y =
        height -
        padding.bottom -
        (point.total_spending / maxValue) * chartHeight * animationProgress;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(
      padding.left + chartWidth * animationProgress,
      height - padding.bottom
    );
    ctx.closePath();
    ctx.fill();

    // Draw area under gambling spending line
    ctx.fillStyle = gamblingGradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);

    chartData.forEach((point, index) => {
      const x =
        padding.left +
        (chartWidth / (chartData.length - 1)) * index * animationProgress;
      const y =
        height -
        padding.bottom -
        (point.gambling_spending / maxValue) * chartHeight * animationProgress;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(
      padding.left + chartWidth * animationProgress,
      height - padding.bottom
    );
    ctx.closePath();
    ctx.fill();

    // Draw total spending line
    ctx.strokeStyle = "#14b8a6"; // teal-500
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x =
        padding.left +
        (chartWidth / (chartData.length - 1)) * index * animationProgress;
      const y =
        height -
        padding.bottom -
        (point.total_spending / maxValue) * chartHeight * animationProgress;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw gambling spending line
    ctx.strokeStyle = "#ef4444"; // red-500
    ctx.lineWidth = 3;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x =
        padding.left +
        (chartWidth / (chartData.length - 1)) * index * animationProgress;
      const y =
        height -
        padding.bottom -
        (point.gambling_spending / maxValue) * chartHeight * animationProgress;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    chartData.forEach((point, index) => {
      const x =
        padding.left +
        (chartWidth / (chartData.length - 1)) * index * animationProgress;
      const totalY =
        height -
        padding.bottom -
        (point.total_spending / maxValue) * chartHeight * animationProgress;
      const gamblingY =
        height -
        padding.bottom -
        (point.gambling_spending / maxValue) * chartHeight * animationProgress;

      // Total spending point
      ctx.fillStyle = "#14b8a6";
      ctx.beginPath();
      ctx.arc(x, totalY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Gambling spending point
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(x, gamblingY, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw month labels
    ctx.fillStyle = "#94a3b8"; // slate-400
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";

    const monthLabels = ["3 months ago", "2 months ago", "1 month ago", "Now"];
    for (let i = 0; i < 4; i++) {
      const x = padding.left + (chartWidth / 3) * i;
      ctx.fillText(monthLabels[i], x, height - 10);
    }

    // Draw Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i);
      const y = padding.top + (chartHeight / 5) * i + 4;
      ctx.fillText(
        `$${Math.round(value).toLocaleString()}`,
        padding.left - 10,
        y
      );
    }
  }, [chartData, animationProgress, loading]);

  // Handle mouse move for hover effects
  const handleMouseMove = (e) => {
    if (!chartData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 20 };
    const chartWidth = rect.width - padding.left - padding.right;

    const pointIndex = Math.round(
      ((x - padding.left) / chartWidth) * (chartData.length - 1)
    );

    if (pointIndex >= 0 && pointIndex < chartData.length) {
      setHoveredPoint({
        index: pointIndex,
        data: chartData[pointIndex],
        x: x,
      });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/20 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/20 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No spending data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/20 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Spending Trends
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-slate-300">Total Spending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-300">Gambling</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-teal-400" />
                <span className="text-xs text-slate-400">90-Day Total</span>
              </div>
              <div className="text-sm font-semibold text-white">
                ${summary.total_spending_90_days.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                {summary.gambling_trend_percentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-400" />
                )}
                <span className="text-xs text-slate-400">Gambling Trend</span>
              </div>
              <div
                className={`text-sm font-semibold ${
                  summary.gambling_trend_percentage >= 0
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {summary.gambling_trend_percentage >= 0 ? "+" : ""}
                {summary.gambling_trend_percentage}%
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-48 cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* Hover tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-xl z-10 pointer-events-none"
              style={{
                left: `${hoveredPoint.x - 75}px`,
                top: "20px",
              }}
            >
              <div className="text-xs text-slate-300 mb-2">
                {new Date(hoveredPoint.data.date).toLocaleDateString()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <span className="text-sm text-slate-300">Total: </span>
                  <span className="text-sm font-semibold text-white">
                    ${hoveredPoint.data.total_spending.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-300">Gambling: </span>
                  <span className="text-sm font-semibold text-white">
                    ${hoveredPoint.data.gambling_spending.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
