import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (user) {
    return null; // Or a loading state while redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">VL</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome to Virtual Lab</CardTitle>
            <CardDescription className="text-slate-600">
              Access the lab as a guest and explore our experiments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
                onClick={() => navigate("/")}
              >
                Enter as Guest
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-slate-500">
              Authentication is currently disabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;