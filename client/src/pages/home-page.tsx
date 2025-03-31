import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Leaderboard from "@/components/leaderboard/leaderboard";
import AddPoints from "@/components/leaderboard/add-points";

import AdminPanel from "@/components/leaderboard/admin-panel";

type LeaderboardUser = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const refreshFnRef = useRef<(() => Promise<void>) | null>(null);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handlePointsAdded = () => {
    if (refreshFnRef.current) {
      refreshFnRef.current();
    }
  };
  
  // Function to refresh the leaderboard data
  const handleLeaderboardRefresh = (refreshFn: () => Promise<void>) => {
    refreshFnRef.current = refreshFn;
  };
  
  // Function to receive users data from the Leaderboard component
  const handleUsersLoaded = (users: LeaderboardUser[]) => {
    setLeaderboardUsers(users);
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
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6">
      {/* Header */}
      <div className="w-full max-w-5xl mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold gradient-heading">
          Welcome, <span className="text-yellow-400">{userName}</span>!
        </h1>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/80 transition-all duration-300"
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
        {/* Left column */}
        <div className="w-full md:w-2/3 space-y-6">
          <Leaderboard 
            key={refreshTrigger} 
            onUsersLoaded={handleUsersLoaded}
            onRefresh={handleLeaderboardRefresh}
          />
          
          {/* AdminPanel appears below the leaderboard */}
          <AdminPanel 
            users={leaderboardUsers} 
            onPointsUpdated={handlePointsAdded} 
          />
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Only show AddPoints for admin user */}
          {user?.email === "ademmsallem782@gmail.com" && (
            <AddPoints onPointsAdded={handlePointsAdded} />
          )}
        </div>
      </div>
    </div>
  );
}
