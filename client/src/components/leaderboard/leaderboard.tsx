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

type LeaderboardProps = {
  onUsersLoaded?: (users: LeaderboardUser[]) => void;
  onRefresh?: (refreshFn: () => Promise<void>) => void;
};

export default function Leaderboard({ onUsersLoaded, onRefresh }: LeaderboardProps = {}) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Helper function to create the profiles_with_points view if it doesn't exist
  const createProfilesWithPointsView = async () => {
    try {
      console.log('Attempting to create profiles_with_points view...');
      
      // First, try to create the points table if it doesn't exist
      const { error: createTableError } = await supabase.rpc('create_points_table_if_not_exists');
      
      if (createTableError) {
        console.error('Error creating points table:', createTableError);
        // Update the toast message to guide the user
        toast({
          title: "Setup required",
          description: "Please run the SQL setup script in Supabase first. Check the Setup SQL tab for instructions.",
          variant: "destructive",
        });
        return false;
      }
      
      // Then try to create the view
      const { error: createViewError } = await supabase.rpc('create_profiles_with_points_view');
      
      if (createViewError) {
        console.error('Error creating view:', createViewError);
        // Update the toast message to guide the user
        toast({
          title: "Setup required",
          description: "Please run the SQL setup script in Supabase first. Check the Setup SQL tab for instructions.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Successfully created profiles_with_points view');
      return true;
    } catch (error) {
      console.error('Error setting up leaderboard tables:', error);
      toast({
        title: "Setup required",
        description: "Please run the SQL setup script in Supabase first. Check the Setup SQL tab for instructions.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Function to fetch leaderboard data - can be called to refresh
  const fetchLeaderboard = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Attempt to fetch the leaderboard data directly
      const { data, error } = await supabase
        .from('profiles_with_points')
        .select('id, name, points')
        .order('points', { ascending: false });
      
      // Handle error if the view doesn't exist yet
      if (error) {
        console.error('Error fetching leaderboard:', error);
        
        // If the error is because the view doesn't exist, try to create it
        if (error.code === '42P01') { // Relation does not exist
          console.log('profiles_with_points view not found, attempting to create it');
          const success = await createProfilesWithPointsView();
          
          // Only retry the query if the view was successfully created
          if (success) {
            // Try the query again after creating the view
            const retryResult = await supabase
              .from('profiles_with_points')
              .select('id, name, points')
              .order('points', { ascending: false });
              
            if (retryResult.error) {
              throw retryResult.error;
            }
            
            // Transform the data and add ranks
            const rankedUsers = (retryResult.data || []).map((user: any, index: number) => ({
              ...user,
              rank: index + 1,
              name: user.name || user.id.substring(0, 8) // Use part of ID if name is not available
            }));
            
            setUsers(rankedUsers);
            
            // If onUsersLoaded callback is provided, send the users data to parent component
            if (onUsersLoaded) {
              onUsersLoaded(rankedUsers);
            }
            
            return; // Exit the function since we've handled the data
          } else {
            // If creating the view failed, exit early and keep loading false
            setLoading(false);
            return;
          }
        } else {
          // If it's some other error, throw it
          throw error;
        }
      }
      
      // If we get here, there was no error with the initial query
      // Transform the data and add ranks
      const rankedUsers = (data || []).map((user: any, index: number) => ({
        ...user,
        rank: index + 1,
        name: user.name || user.id.substring(0, 8) // Use part of ID if name is not available
      }));
      
      setUsers(rankedUsers);
      
      // If onUsersLoaded callback is provided, send the users data to parent component
      if (onUsersLoaded) {
        onUsersLoaded(rankedUsers);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Failed to load leaderboard",
        description: "Please run the SQL setup script in Supabase first. Check the Setup SQL tab for instructions.",
        variant: "destructive",
      });
      // Set users to empty array to avoid mapping errors
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // If onRefresh callback is provided, send the refresh function to parent component
    if (onRefresh) {
      onRefresh(fetchLeaderboard);
    }
  }, [toast, onUsersLoaded, onRefresh]);

  // Function to get the background color for ranks - matches the screenshot
  const getRankColor = (rank: number) => {
    // All ranks appear to use the same yellow color in the screenshot
    return "bg-yellow-500";
  };

  // We're using a consistent text color now based on the screenshot

  return (
    <Card className="w-full max-w-3xl glass-card border-yellow-500/50 shadow-lg">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-2xl font-bold gradient-heading">
          Eagle Studio Leaderboard
        </CardTitle>
        <p className="text-gray-400 text-sm mt-1">إنجز المهام وإربح النقاط</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((leaderboardUser) => (
              <div 
                key={leaderboardUser.id}
                className="flex items-center justify-between p-4 rounded-md bg-black/30 backdrop-blur-sm border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`flex items-center justify-center w-9 h-9 rounded-full ${getRankColor(leaderboardUser.rank)} text-black font-bold shadow-md`}
                  >
                    {leaderboardUser.rank}
                  </div>
                  <span className="text-lg text-white font-medium">
                    {leaderboardUser.name}
                  </span>
                </div>
                <div className="text-lg font-medium">
                  <span className="text-yellow-400">{leaderboardUser.points}</span> <span className="text-yellow-500/70">نقطة</span>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="border-2 border-dashed border-yellow-500/30 rounded-lg p-8 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-yellow-500 text-2xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Users Yet</h3>
                    <p className="text-gray-400">
                      Create an account and be the first to earn points on the leaderboard!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}