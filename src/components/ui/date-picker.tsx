"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  error?: string
  required?: boolean
  label?: string
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
  minDate,
  maxDate,
  error,
  required = false,
  label
}: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 text-left">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-11",
              !date && "text-muted-foreground",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: fr }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabled || (minDate && { before: minDate }) || (maxDate && { after: maxDate })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
} 