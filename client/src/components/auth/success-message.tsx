import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { motion } from "framer-motion";

export type SuccessMessageProps = {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
};

export default function SuccessMessage({
  title,
  description,
  buttonText,
  onButtonClick,
}: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-6"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <CheckIcon className="h-8 w-8 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      
      <Button onClick={onButtonClick} className="w-full">
        {buttonText}
      </Button>
    </motion.div>
  );
}
