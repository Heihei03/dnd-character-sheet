import React, { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define prop types
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "danger" | "ghost-danger" | "success" | "secondary" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className, 
  variant = "primary",
  size = "default",
  type = "button",
  disabled = false,
  title
}) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    "ghost-danger": "bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    outline: "bg-transparent border border-border hover:bg-secondary/50 text-foreground"
  };

  const sizes = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "p-2 aspect-square"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2",
        sizes[size],
        disabled ? "opacity-50 cursor-not-allowed shadow-none" : variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
