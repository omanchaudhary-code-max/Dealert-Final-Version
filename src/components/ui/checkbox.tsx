"use client";

import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer ${className}`}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
