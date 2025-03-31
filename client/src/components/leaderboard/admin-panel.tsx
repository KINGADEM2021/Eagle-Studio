import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type LeaderboardUser = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

// Admin email constant
const ADMIN_EMAIL = "ademmsallem782@gmail.com";

export default function AdminPanel({ 
  users, 
  onPointsUpdated 
}: { 
  users: LeaderboardUser[]; 
  onPointsUpdated: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if the current user is the authorized admin
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      setIsAuthorizedAdmin(true);
    } else {
      setIsAuthorizedAdmin(false);
      // If not admin, ensure admin mode is disabled
      setIsAdmin(false);
    }
  }, [user]);

  const handlePointChange = async (userId: string, pointChange: number) => {
    if (!isAdmin || !isAuthorizedAdmin) return;

    try {
      // Set loading state for this specific user
      setLoading(prev => ({ ...prev, [userId]: true }));

      // Call Supabase RPC to add points
      const { error } = await supabase.rpc('add_points_to_user', {
        user_uuid: userId,
        points_to_add: pointChange
      });

      if (error) throw error;

      toast({
        title: "Points updated",
        description: `${Math.abs(pointChange)} points have been ${pointChange >= 0 ? 'added to' : 'deducted from'} the user.`,
      });

      // Refresh the leaderboard
      onPointsUpdated();
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: "Failed to update points",
        description: "An error occurred while updating points. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear loading state for this user
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Define the point change buttons to match the screenshot
  const pointButtons = [
    { value: -1, label: "-1", className: "bg-red-500 hover:bg-red-600" },
    { value: 1, label: "+1", className: "bg-emerald-500 hover:bg-emerald-600" },
    { value: -5, label: "-5", className: "bg-red-600 hover:bg-red-700" },
    { value: 5, label: "+5", className: "bg-emerald-600 hover:bg-emerald-700" },
    { value: -10, label: "-10", className: "bg-red-700 hover:bg-red-800" },
    { value: 10, label: "+10", className: "bg-emerald-700 hover:bg-emerald-800" },
    { value: 2, label: "+2", className: "bg-emerald-700 hover:bg-emerald-800" },
  ];

  return (
    <Card className="bg-black border-yellow-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
          Admin Panel
        </CardTitle>
        {isAuthorizedAdmin && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="admin-mode" 
              checked={isAdmin} 
              onCheckedChange={setIsAdmin} 
              className="data-[state=checked]:bg-yellow-500"
            />
            <Label htmlFor="admin-mode" className="text-white">
              Admin Mode
            </Label>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {!isAuthorizedAdmin ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <ShieldAlert className="w-8 h-8 text-yellow-500" />
            <p className="text-gray-400 text-sm">
              Only the admin (ademmsallem782@gmail.com) can modify user points
            </p>
          </div>
        ) : !isAdmin ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Enable Admin Mode to modify user points
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-black p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-black text-sm font-bold`}>
                      {user.rank}
                    </span>
                    <span className="text-white font-medium">
                      {user.name}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    <span className="text-white">{user.points}</span> نقطة
                  </span>
                </div>

                <div className="flex flex-wrap justify-end gap-1">
                  {pointButtons.map((btn) => (
                    <Button
                      key={`${user.id}-${btn.value}`}
                      size="sm"
                      className={`${btn.className} text-xs h-7 min-w-7 px-2`}
                      disabled={loading[user.id]}
                      onClick={() => handlePointChange(user.id, btn.value)}
                    >
                      {loading[user.id] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        btn.label
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                No users found in the leaderboard
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}