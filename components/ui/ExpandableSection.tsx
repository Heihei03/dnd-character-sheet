"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
    title: string;
    children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-border rounded-lg mb-3 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center p-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
                <span className="font-semibold uppercase text-xs tracking-widest">{title}</span>
                <span><ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${open ? "rotate-180" : ""}`} /></span>
            </button>

            {open && (
                <div className="p-3 bg-card text-card-foreground border-t border-border">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ExpandableSection;
