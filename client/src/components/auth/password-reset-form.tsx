import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

type PasswordResetFormProps = {
  onBackToSignInClick: () => void;
  onSuccess: (
    title: string,
    description: string,
    buttonText: string,
    onButtonClick: () => void
  ) => void;
};

export default function PasswordResetForm({
  onBackToSignInClick,
  onSuccess,
}: PasswordResetFormProps) {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    // In a real app, this would call an API endpoint to reset the password
    // For this demo, we'll just simulate a successful password reset request
    
    setTimeout(() => {
      onSuccess(
        "Check Your Email",
        `We've sent a password reset link to ${data.email}. Please check your inbox.`,
        "Back to Sign In",
        onBackToSignInClick
      );
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Reset Your Password
        </h1>
        <p className="text-gray-500 text-sm">
          We'll send you a link to reset your password
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Button
          variant="link"
          onClick={onBackToSignInClick}
          className="p-0 h-auto font-medium text-primary hover:text-primary/80"
        >
          Back to Sign In
        </Button>
      </p>
    </motion.div>
  );
}
