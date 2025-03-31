import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AuthError, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User | null, AuthError, LoginData>;
  logoutMutation: UseMutationResult<void, AuthError, void>;
  registerMutation: UseMutationResult<User | null, AuthError, RegisterData>;
  resetPasswordMutation: UseMutationResult<void, AuthError, { email: string }>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  name?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Use React Query to fetch and cache the current user session
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["supabase-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refetch();
      } else {
        queryClient.setQueryData(["supabase-user"], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  // Login mutation
  const loginMutation = useMutation<User | null, AuthError, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      refetch(); // Refetch user data after successful login
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: AuthError) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<User | null, AuthError, RegisterData>({
    mutationFn: async (credentials: RegisterData) => {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || "",
          },
        },
      });
      
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      refetch(); // Refetch user data after successful registration
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email for verification.",
      });
    },
    onError: (error: AuthError) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, AuthError, void>({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(["supabase-user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: AuthError) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation<void, AuthError, { email: string }>({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password reset link sent",
        description: "Please check your email for the password reset link.",
      });
    },
    onError: (error: AuthError) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}