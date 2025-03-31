import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Leaderboard from "@/components/leaderboard/leaderboard";
import AddPoints from "@/components/leaderboard/add-points";
import SetupSQL from "@/components/leaderboard/setup-sql";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handlePointsAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user.user_metadata?.name || user.email;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-950 p-6">
      {/* Header */}
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          Welcome, <span className="text-primary">{userName}</span>!
        </h1>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="border-primary text-primary hover:bg-primary/10"
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            "Sign Out"
          )}
        </Button>
      </div>

      {/* Main content */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Leaderboard */}
        <div className="w-full md:w-3/4">
          <Leaderboard key={refreshTrigger} />
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/4 space-y-6">
          <AddPoints onPointsAdded={handlePointsAdded} />
          <SetupSQL />
        </div>
      </div>
    </div>
  );
}
