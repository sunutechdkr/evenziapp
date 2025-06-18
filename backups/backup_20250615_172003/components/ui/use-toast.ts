// Toast hook using Sonner for notifications
import { toast as sonnerToast } from "sonner";

export interface ToastMessage {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast({ title, description, variant = "default" }: ToastMessage) {
  const message = title || description || "";
  
  if (variant === "destructive") {
    sonnerToast.error(message);
  } else {
    sonnerToast.success(message);
  }
}

export function useToast() {
  return { toast };
} 