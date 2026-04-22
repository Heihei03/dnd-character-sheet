"use client";

import { useEffect, useState } from "react";

interface ModalScrollLockProps {
    isOpen: boolean;
}

const ModalScrollLock: React.FC<ModalScrollLockProps> = ({ isOpen }) => {
    useEffect(() => {
        if (!isOpen) return;

        // Save original styles
        const originalOverflow = window.getComputedStyle(document.body).overflow;
        const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
        
        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Prevent scroll and layout shift
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.body.style.overflow = "hidden";

        // Re-enable scroll and original styles when component unmounts
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isOpen]);

    return null;
};

export default ModalScrollLock;
