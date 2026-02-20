"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
    title: string;
    children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border rounded-lg mb-3">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center p-3 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
                <span className="font-semibold">{title}</span>
                <span>{open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</span>
            </button>

            {open && (
                <div className="p-3 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ExpandableSection;
