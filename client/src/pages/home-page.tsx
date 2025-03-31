import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Leaderboard from "@/components/leaderboard/leaderboard";
import AddPoints from "@/components/leaderboard/add-points";
import SetupSQL from "@/components/leaderboard/setup-sql";
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
          <AddPoints onPointsAdded={handlePointsAdded} />
          <SetupSQL />
        </div>
      </div>
    </div>
  );
}
