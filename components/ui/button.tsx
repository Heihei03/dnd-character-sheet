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
  variant?: "primary" | "ghost" | "danger" | "ghost-danger" | "success" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className, 
  variant = "primary",
  type = "button",
  disabled = false,
  title
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    "ghost-danger": "bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2",
        disabled ? "opacity-50 cursor-not-allowed shadow-none" : variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
