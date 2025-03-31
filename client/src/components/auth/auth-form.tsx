import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SignUpForm from "./signup-form";
import SignInForm from "./signin-form";
import PasswordResetForm from "./password-reset-form";
import SuccessMessage, { SuccessMessageProps } from "./success-message";
import { motion } from "framer-motion";

type FormView = "signup" | "signin" | "reset" | "success";

export default function AuthForm() {
  const [view, setView] = useState<FormView>("signup");
  const [successInfo, setSuccessInfo] = useState<SuccessMessageProps>({
    title: "",
    description: "",
    buttonText: "",
    onButtonClick: () => {},
  });

  const handleViewChange = (view: FormView) => {
    setView(view);
  };

  const handleSuccess = (
    title: string,
    description: string,
    buttonText: string,
    onButtonClick: () => void
  ) => {
    setSuccessInfo({
      title,
      description,
      buttonText,
      onButtonClick,
    });
    setView("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {view !== "reset" && view !== "success" && (
          <Tabs
            defaultValue={view}
            value={view}
            onValueChange={(v) => handleViewChange(v as FormView)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 rounded-none">
              <TabsTrigger
                value="signup"
                className="py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="signin"
                className="py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Sign In
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="p-6 md:p-8">
              <SignUpForm
                onSignInClick={() => handleViewChange("signin")}
                onSuccess={handleSuccess}
              />
            </TabsContent>

            <TabsContent value="signin" className="p-6 md:p-8">
              <SignInForm
                onSignUpClick={() => handleViewChange("signup")}
                onForgotPasswordClick={() => handleViewChange("reset")}
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </Tabs>
        )}

        {view === "reset" && (
          <div className="p-6 md:p-8">
            <PasswordResetForm
              onBackToSignInClick={() => handleViewChange("signin")}
              onSuccess={handleSuccess}
            />
          </div>
        )}

        {view === "success" && (
          <div className="p-6 md:p-8">
            <SuccessMessage
              title={successInfo.title}
              description={successInfo.description}
              buttonText={successInfo.buttonText}
              onButtonClick={successInfo.onButtonClick}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
