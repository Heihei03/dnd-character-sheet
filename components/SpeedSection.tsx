"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Speed } from "../types/character";
import { speedTypes } from "../utils/constants";
import FeatureNavigationBadge from "./features/FeatureNavigationBadge";
import NumericInput from "./ui/NumericInput";

interface SpeedSectionProps {
  baseSpeed: Speed;
  effectiveSpeed: Speed;
  setSpeed: (key: string, value: number, from?: string) => void;
  onNavigateToFeature?: (featureId: string) => void;
}

const SpeedSection: React.FC<SpeedSectionProps> = ({ baseSpeed, effectiveSpeed, setSpeed, onNavigateToFeature }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key: string, value: number, from?: string) => {
    setSpeed(key, value, from);
  };

  return (
    <div className="border border-border p-3 rounded shadow-sm bg-card text-card-foreground transition-all">
      {/* Collapsed Header */}
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col">
          <span className="font-bold text-xs uppercase text-gray-400 tracking-wider">Speed</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground">{effectiveSpeed.walk.value}</span>
            <span className="text-sm font-bold text-muted-foreground">ft</span>
          </div>
        </div>
        <div className={`text-gray-400 group-hover:text-primary transition-all duration-300 ${expanded ? "rotate-180" : "rotate-0"}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
          {speedTypes.map((key) => {
            const baseData = baseSpeed[key] || { value: 0, from: "Base" };
            const effectiveData = effectiveSpeed[key] || { value: 0 };
            const hasModifier = effectiveData.value !== baseData.value;
            const fromFeatureId = effectiveData.from;

            return (
              <div key={key} className="space-y-1 bg-secondary/50 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-bold text-sm text-muted-foreground">{key}</span>
                  <div className="flex items-center gap-2">
                    {hasModifier && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                        {effectiveData.value > baseData.value ? `+${effectiveData.value - baseData.value}` : effectiveData.value - baseData.value} ft
                      </span>
                    )}
                    <span className="text-sm font-black">{effectiveData.value} ft</span>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] uppercase font-bold text-gray-400 ml-1">Base</label>
                    <div className="flex gap-2 items-center">
                      <NumericInput
                        value={baseData.value}
                        onChange={(val) => handleChange(key, val, baseData.from)}
                        variant="horizontal"
                        className="w-24 h-8"
                        inputClassName="text-sm p-1 text-center font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Origin"
                        value={baseData.from ?? ""}
                        onChange={(e) =>
                          handleChange(
                            key,
                            baseData.value,
                            e.target.value || undefined
                          )
                        }
                        className="flex-1 text-xs p-1 border border-border rounded bg-background"
                      />
                    </div>
                  </div>
                </div>

                {fromFeatureId && (
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700 mt-1">
                    <span className="text-[11px] uppercase font-bold text-gray-400">Modifier Source:</span>
                    <FeatureNavigationBadge
                      featureId={fromFeatureId}
                      onNavigateToFeature={() => onNavigateToFeature?.(fromFeatureId)}
                      variant="compact"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpeedSection;
