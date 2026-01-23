"use client";

import { useState } from "react";
import { Speed } from "../types/character";
import { speedTypes } from "../utils/constants";

interface SpeedSectionProps {
  speed: Speed;
  setSpeed: (key: string, value: number, from?: string) => void;
}

const SpeedSection: React.FC<SpeedSectionProps> = ({ speed, setSpeed }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key: string, value: number, from?: string) => {
    setSpeed(key, value, from);
  };

  return (
    <div className="border p-3 rounded">
      {/* Collapsed Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-bold text-lg">Speed</span>
        <span className="text-lg">{speed.walk.value} ft</span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {speedTypes.map((key) => {
            const data = speed[key] || { value: 0, from: "" };
            return (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{key}</span>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={data.value}
                    onChange={(e) =>
                      handleChange(key, parseInt(e.target.value) || 0, data.from)
                    }
                    className="w-20 text-center border rounded"
                  />

                  <input
                    type="text"
                    placeholder="Origin (optional)"
                    value={data.from ?? ""}
                    onChange={(e) =>
                      handleChange(
                        key,
                        data.value,
                        e.target.value || undefined
                      )
                    }
                    className="w-40 border rounded text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpeedSection;
