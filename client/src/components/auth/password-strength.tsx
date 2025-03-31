import { cn } from "@/lib/utils";

type PasswordStrengthProps = {
  password: string;
};

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    
    // Lowercase and uppercase check
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    
    // Number check
    if (password.match(/[0-9]/)) strength++;
    
    // Special character check
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    return strength;
  };

  const strength = calculateStrength(password);
  
  const getStrengthText = (strength: number): { text: string; color: string } => {
    if (password.length === 0) {
      return { text: "Password must be at least 8 characters", color: "text-gray-500" };
    } else if (strength === 1) {
      return { text: "Weak password", color: "text-red-500" };
    } else if (strength === 2) {
      return { text: "Fair password", color: "text-yellow-500" };
    } else if (strength === 3) {
      return { text: "Good password", color: "text-green-500" };
    } else {
      return { text: "Strong password", color: "text-green-500" };
    }
  };

  const getBarColor = (index: number, strength: number): string => {
    if (index >= strength) return "bg-gray-200";
    
    switch (strength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const strengthInfo = getStrengthText(strength);

  return (
    <div className="mt-1">
      <div className="flex items-center mt-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1 w-1/4 rounded-full",
              getBarColor(index, strength),
              index > 0 && "ml-1"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs mt-1", strengthInfo.color)}>
        {strengthInfo.text}
      </p>
    </div>
  );
}
