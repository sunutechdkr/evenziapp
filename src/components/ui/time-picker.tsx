"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface TimePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, label, error, required = false, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label className="text-sm font-medium text-gray-700 text-left">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ClockIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="time"
            className={cn(
              "pl-10 block w-full rounded-md focus:ring-2 focus:ring-offset-0 border border-input bg-background h-11",
              error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)
TimePicker.displayName = "TimePicker"

export { TimePicker } 