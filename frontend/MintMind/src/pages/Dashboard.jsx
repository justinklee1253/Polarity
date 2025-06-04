import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic here
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              MintMind Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Ready to manage your finances?
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-sky-200 text-sky-700 hover:bg-sky-50"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sky-700">Budget Overview</CardTitle>
              <CardDescription>Your spending this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600">$1,247.50</div>
              <p className="text-sm text-gray-600">of $2,000 budget</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-cyan-700">Savings Goal</CardTitle>
              <CardDescription>Emergency fund progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">$850.00</div>
              <p className="text-sm text-gray-600">of $1,000 goal</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-700">Recent Activity</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">5</div>
              <p className="text-sm text-gray-600">transactions today</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🎉 Your authentication system is working! Now you can integrate your
            actual API routes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
