"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Sélectionner l'heure",
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<string>(
    value ? value.split(":")[0] : ""
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    value ? value.split(":")[1] : ""
  );

  // Générer les heures (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Générer les minutes (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  const handleTimeChange = (hour: string, minute: string) => {
    if (hour && minute && onChange) {
      const timeString = `${hour}:${minute}`;
      onChange(timeString);
    }
  };

  React.useEffect(() => {
    if (selectedHour && selectedMinute) {
      handleTimeChange(selectedHour, selectedMinute);
    }
  }, [selectedHour, selectedMinute]);

  const formatDisplayTime = (time: string) => {
    if (!time) return placeholder;
    const [hour, minute] = time.split(":");
    return `${hour}:${minute}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            "hover:bg-primary/5 border-primary/20 focus:border-primary focus:ring-primary/20",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-primary" />
          {formatDisplayTime(value || "")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-4" align="start">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Heure
            </label>
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger className="focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem 
                    key={hour} 
                    value={hour}
                    className="hover:bg-primary/10 focus:bg-primary/10"
                  >
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xl font-bold text-primary pt-6">:</div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Minutes
            </label>
            <Select value={selectedMinute} onValueChange={setSelectedMinute}>
              <SelectTrigger className="focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem 
                    key={minute} 
                    value={minute}
                    className="hover:bg-primary/10 focus:bg-primary/10"
                  >
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => setOpen(false)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Confirmer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 