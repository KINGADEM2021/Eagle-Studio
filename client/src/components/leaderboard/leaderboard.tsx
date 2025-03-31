import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

type LeaderboardUser = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // First, ensure the profiles_with_points view exists (create it if it doesn't)
        await createProfilesWithPointsView();
        
        // Then fetch the leaderboard data
        const { data, error } = await supabase
          .from('profiles_with_points')
          .select('id, name, points')
          .order('points', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform the data and add ranks
        const rankedUsers = data.map((user, index) => ({
          ...user,
          rank: index + 1,
          name: user.name || user.id.substring(0, 8) // Use part of ID if name is not available
        }));
        
        setUsers(rankedUsers);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast({
          title: "Failed to load leaderboard",
          description: "Could not retrieve the leaderboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [toast]);
  
  // Helper function to create the profiles_with_points view if it doesn't exist
  const createProfilesWithPointsView = async () => {
    try {
      // Check if we can query the view - if it works, the view exists
      const { error } = await supabase
        .from('profiles_with_points')
        .select('id')
        .limit(1);
      
      // If there's no error, the view exists and we can return
      if (!error) return;
      
      // If we get here, we need to create the view
      // First, create the points table if it doesn't exist
      const { error: createTableError } = await supabase.rpc('create_points_table_if_not_exists');
      
      if (createTableError) {
        console.error('Error creating points table:', createTableError);
        // Try direct SQL if RPC fails - would need admin rights
        // Note: This may not work if the user doesn't have admin rights
        console.warn('Could not create points table - you may need to execute this SQL in the Supabase dashboard');
      }
      
      // Create the view
      const { error: createViewError } = await supabase.rpc('create_profiles_with_points_view');
      
      if (createViewError) {
        console.error('Error creating view:', createViewError);
        // Try direct SQL if RPC fails - would need admin rights
        // Note: This may not work if the user doesn't have admin rights
        console.warn('Could not create profiles_with_points view - you may need to execute this SQL in the Supabase dashboard');
      }
    } catch (error) {
      console.error('Error setting up leaderboard tables:', error);
    }
  };

  // Function to get the background color for ranks
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-amber-700";
    return "bg-gray-800";
  };

  // Function to get text color based on if it's the current user
  const getTextColor = (userId: string) => {
    return user?.id === userId ? "text-primary font-bold" : "text-white";
  };

  return (
    <Card className="w-full max-w-3xl bg-black border-yellow-500">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
          Eagle Studio Leaderboard
        </CardTitle>
        <p className="text-gray-400 text-sm">إنجز المهام وإربح النقاط</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((leaderboardUser) => (
              <div 
                key={leaderboardUser.id}
                className="flex items-center justify-between p-3 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(leaderboardUser.rank)} text-white font-bold`}
                  >
                    {leaderboardUser.rank}
                  </div>
                  <span className={`text-lg ${getTextColor(leaderboardUser.id)}`}>
                    {leaderboardUser.name}
                  </span>
                </div>
                <div className={`${getTextColor(leaderboardUser.id)} text-lg font-medium`}>
                  {leaderboardUser.points} نقطة
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No users on the leaderboard yet. Be the first to earn points!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}