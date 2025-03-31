import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// SQL for creating the points table and functions
const CREATE_POINTS_TABLE = `
CREATE TABLE IF NOT EXISTS points (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (user_id)
);
`;

const CREATE_POINTS_TABLE_FUNCTION = `
CREATE OR REPLACE FUNCTION create_points_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS points (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (user_id)
  );
END;
$$ LANGUAGE plpgsql;
`;

const CREATE_ADD_POINTS_FUNCTION = `
CREATE OR REPLACE FUNCTION add_points_to_user(user_uuid UUID, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO points (user_id, points)
  VALUES (user_uuid, points_to_add)
  ON CONFLICT (user_id) 
  DO UPDATE SET points = points.points + points_to_add;
END;
$$ LANGUAGE plpgsql;
`;

const CREATE_PROFILES_WITH_POINTS_VIEW = `
CREATE OR REPLACE VIEW profiles_with_points AS
SELECT 
  u.id,
  u.raw_user_meta_data->>'name' as name,
  COALESCE(p.points, 0) as points
FROM auth.users u
LEFT JOIN points p ON u.id = p.user_id;
`;

const CREATE_PROFILES_VIEW_FUNCTION = `
CREATE OR REPLACE FUNCTION create_profiles_with_points_view()
RETURNS void AS $$
BEGIN
  CREATE OR REPLACE VIEW profiles_with_points AS
  SELECT 
    u.id,
    u.raw_user_meta_data->>'name' as name,
    COALESCE(p.points, 0) as points
  FROM auth.users u
  LEFT JOIN points p ON u.id = p.user_id;
END;
$$ LANGUAGE plpgsql;
`;

// Grant privileges for the public role to call these functions
const GRANT_PRIVILEGES = `
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON profiles_with_points TO anon, authenticated, service_role;
GRANT ALL ON points TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_points_table_if_not_exists TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_profiles_with_points_view TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_points_to_user TO anon, authenticated, service_role;
`;

export default function SetupSQL() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (sql: string) => {
    navigator.clipboard.writeText(sql).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "SQL has been copied to your clipboard.",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy SQL to clipboard. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

  const setupSQL = [
    { name: "Create Points Table", sql: CREATE_POINTS_TABLE },
    { name: "Create Points Table Function", sql: CREATE_POINTS_TABLE_FUNCTION },
    { name: "Create Add Points Function", sql: CREATE_ADD_POINTS_FUNCTION },
    { name: "Create Profiles View", sql: CREATE_PROFILES_WITH_POINTS_VIEW },
    { name: "Create Profiles View Function", sql: CREATE_PROFILES_VIEW_FUNCTION },
    { name: "Grant Privileges", sql: GRANT_PRIVILEGES },
  ];

  return (
    <Card className="glass-card border-yellow-500/50 shadow-lg mt-4">
      <CardHeader>
        <CardTitle className="gradient-heading font-bold">Supabase SQL Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black/40 p-4 rounded-lg mb-6 border border-yellow-500/20">
          <p className="text-gray-300">
            To enable the leaderboard functionality, you need to set up some SQL functions in your Supabase project. 
            Copy and run these scripts in your Supabase SQL editor:
          </p>
        </div>
        <div className="space-y-3">
          {setupSQL.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start border-yellow-500/30 text-white hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-200 py-3 h-auto"
              onClick={() => copyToClipboard(item.sql)}
            >
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3 text-sm text-yellow-400">
                  {index + 1}
                </span>
                <span>Copy: {item.name}</span>
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}