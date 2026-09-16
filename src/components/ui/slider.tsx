"use client";

import React from "react";

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value,
  defaultValue = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}: SliderProps) {
  const currentVal = value ? value[value.length - 1] : defaultValue[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (onValueChange) {
      if (value && value.length > 1) {
        onValueChange([value[0], num]);
      } else {
        onValueChange([num]);
      }
    }
  };

  return (
    <div className={`relative flex w-full items-center ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentVal}
        onChange={handleChange}
        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}
