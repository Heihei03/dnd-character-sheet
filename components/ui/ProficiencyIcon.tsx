import React from "react";
import { ProficiencyLevel } from "../../types/character";

interface ProficiencyIconProps {
    level: ProficiencyLevel;
    className?: string;
}

const ProficiencyIcon: React.FC<ProficiencyIconProps> = ({ level, className = "w-5 h-5" }) => {
    const baseClasses = `text-current ${className}`;

    switch (level) {
        case "half":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={baseClasses}
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 0 0 20Z" fill="currentColor" stroke="none" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                </svg>
            );
        case "proficient":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={baseClasses}
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
            );
        case "expertise":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={baseClasses}
                >
                    <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        transform="scale(1.15)"
                        style={{ transformOrigin: "center" }}
                    />
                </svg>
            );
        default: // none
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={baseClasses}
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
            );
    }
};

export default ProficiencyIcon;
