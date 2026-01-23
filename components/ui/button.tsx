import React, { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define prop types
interface ButtonProps {
  onClick: () => void; // onClick should be a function that takes no arguments and returns nothing
  children: ReactNode; // children can be any React element or string
  className?: string; // Optional className prop
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
