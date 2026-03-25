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
                    "p-1.5 rounded-full transition-colors text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
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
