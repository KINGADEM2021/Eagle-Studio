import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AddPoints({ onPointsAdded }: { onPointsAdded: () => void }) {
  const [points, setPoints] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddPoints = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to add points.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Try to create points table using RPC if it doesn't exist yet
      const { error: createTableError } = await supabase.rpc('create_points_table_if_not_exists');
      if (createTableError) {
        console.error('Error creating points table:', createTableError);
      }

      // Upsert the points (add if not exists, update if exists) using RPC
      const { error } = await supabase.rpc('add_points_to_user', {
        user_uuid: user.id,
        points_to_add: points
      });

      if (error) throw error;

      toast({
        title: "Points added",
        description: `${points} points have been added to your account.`,
      });

      onPointsAdded();
    } catch (error) {
      console.error("Error adding points:", error);
      toast({
        title: "Failed to add points",
        description: "An error occurred while adding points. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card border-yellow-500/50 shadow-lg">
      <CardHeader>
        <CardTitle className="gradient-heading font-bold">Add Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black/40 p-3 rounded-lg mb-3 border border-yellow-500/20">
          <p className="text-gray-300 text-sm">
            As an admin, you can add points to your own account here. Points will appear on the leaderboard.
          </p>
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min="1"
            className="bg-black/50 text-white border-yellow-500/30 focus:border-yellow-500/70 transition-all"
          />
          <Button 
            onClick={handleAddPoints}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Points"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}