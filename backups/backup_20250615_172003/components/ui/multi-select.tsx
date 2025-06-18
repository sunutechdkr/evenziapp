"use client"

import * as React from "react"
import { X, Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  badges?: Record<string, string>
  loading?: boolean
  searchPlaceholder?: string
  renderOption?: (option: Option) => React.ReactNode
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  badges,
  loading = false,
  searchPlaceholder = "Search...",
  renderOption,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Handle selection of an option
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  // Handle removing a selected option
  const handleRemove = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        className
      )}
    >
      {/* Selected items display and trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex min-h-[40px] w-full flex-wrap items-center rounded-md border border-gray-300 bg-white py-1.5 px-3 text-sm shadow-sm transition-colors",
          isOpen && "border-[#81B441] ring-1 ring-[#81B441]",
          selected.length > 0 && "pl-2",
          disabled && "cursor-not-allowed opacity-60",
          "focus:outline-none cursor-pointer"
        )}
      >
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selected.map((value) => {
              const option = options.find((opt) => opt.value === value)
              return (
                <span
                  key={value}
                  className="m-0.5 flex items-center gap-1 rounded-md bg-[#81B441] bg-opacity-20 px-2 py-0.5 text-xs text-[#5a7e2d]"
                >
                  {option?.label || value}
                  {!disabled && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={(e) => handleRemove(value, e)}
                    />
                  )}
                </span>
              )
            })}
          </div>
        ) : (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {loading && (
            <svg className="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <ChevronDown className={cn("h-4 w-4 text-gray-500", isOpen && "rotate-180")} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {/* Search input */}
          <div className="relative px-2 pb-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full rounded-md border border-gray-200 pl-8 pr-2 py-1.5 text-sm focus:border-[#81B441] focus:outline-none focus:ring-1 focus:ring-[#81B441]"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 cursor-pointer",
                    selected.includes(option.value) && "bg-[#81B441] bg-opacity-10"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex items-center gap-2">
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <span>{option.label}</span>
                    )}
                    {badges && badges[option.value] && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                        {badges[option.value]}
                      </span>
                    )}
                  </div>
                  {selected.includes(option.value) && (
                    <Check className="h-4 w-4 text-[#81B441]" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 