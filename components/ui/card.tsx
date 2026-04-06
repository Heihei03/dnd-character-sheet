import React from "react";
import { cn } from "../../lib/utils";

// Define props for both Card and CardContent
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", id }: CardProps) {
  return (
    <div id={id} className={cn("bg-card text-card-foreground shadow-md rounded-lg border border-border", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
