import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time" | "datetime";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  enableTime?: boolean;
  noCalendar?: boolean;
  time_24hr?: boolean;
  minuteIncrement?: number;
  hourIncrement?: number;
  defaultHour?: number;
  defaultMinute?: number;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  enableTime = false,
  noCalendar = false,
  time_24hr = true,
  minuteIncrement = 1,
  hourIncrement = 1,
  defaultHour = 12,
  defaultMinute = 0,
}: PropsType) {
  useEffect(() => {
    // Tentukan konfigurasi berdasarkan mode
    const isTimeMode = mode === "time";
    const isDateTimeMode = mode === "datetime";
    
    const flatPickr = flatpickr(`#${id}`, {
      mode: isTimeMode || isDateTimeMode ? "single" : (mode || "single"),
      static: false,
      monthSelectorType: "static",
      dateFormat: isTimeMode 
        ? "H:i" 
        : isDateTimeMode 
        ? "Y-m-d H:i" 
        : "Y-m-d",
      defaultDate,
      onChange,
      appendTo: document.body,
      position: "auto",
      
      // Time configuration
      enableTime: enableTime || isTimeMode || isDateTimeMode,
      noCalendar: noCalendar || isTimeMode,
      time_24hr,
      minuteIncrement,
      hourIncrement,
      defaultHour,
      defaultMinute,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [
    mode, 
    onChange, 
    id, 
    defaultDate, 
    enableTime, 
    noCalendar, 
    time_24hr, 
    minuteIncrement, 
    hourIncrement,
    defaultHour,
    defaultMinute
  ]);

  // Tentukan placeholder default berdasarkan mode
  const getDefaultPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (mode) {
      case "time":
        return time_24hr ? "HH:MM" : "HH:MM AM/PM";
      case "datetime":
        return time_24hr ? "YYYY-MM-DD HH:MM" : "YYYY-MM-DD HH:MM AM/PM";
      default:
        return "Select date";
    }
  };

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={getDefaultPlaceholder()}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}