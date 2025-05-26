"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useToast } from "./use-toast"
import { XMarkIcon } from "@heroicons/react/24/outline"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
  onClose?: () => void
}

export function Toast({
  className,
  variant = "default",
  onClose,
  children,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
        variant === "default" && "bg-white border-gray-200",
        variant === "destructive" && "bg-red-50 border-red-300 text-red-800",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ToastTitle({
  className,
  children,
  ...props
}: ToastTitleProps) {
  return (
    <div
      className={cn("font-medium text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ToastDescription({
  className,
  children,
  ...props
}: ToastDescriptionProps) {
  return (
    <div
      className={cn("text-sm opacity-90", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="mb-2 transition-opacity animate-in fade-in-0 zoom-in-95"
        >
          <Toast
            variant={toast.variant}
            onClose={() => dismiss(toast.id)}
          >
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </Toast>
        </div>
      ))}
    </div>
  )
} 