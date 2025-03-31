import { useEffect } from "react";
import { useLocation } from "wouter";
import AuthForm from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form column */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
        <AuthForm />
      </div>

      {/* Hero column */}
      <div className="flex-1 bg-primary p-8 flex flex-col justify-center items-center text-white hidden md:flex">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome to our Platform</h1>
          <p className="text-lg mb-8">
            Join thousands of users who are already enjoying our services. Sign up
            today to get started with your personal dashboard and access all of our
            features.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-white/80">Active users</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-white/80">Premium features</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
