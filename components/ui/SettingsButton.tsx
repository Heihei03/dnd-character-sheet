import React from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    iconSize?: number;
}

const SettingsButton = React.forwardRef<HTMLButtonElement, SettingsButtonProps>(
    ({ className, iconSize = 20, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    "p-1.5 rounded-full transition-colors text-muted-foreground hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed",
                    className
                )}
                {...props}
            >
                <Settings size={iconSize} />
            </button>
        );
    }
);

SettingsButton.displayName = "SettingsButton";

export default SettingsButton;
