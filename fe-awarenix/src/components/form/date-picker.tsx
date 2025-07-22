// DatePicker.tsx
import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import { Options as FlatpickrOptions } from "flatpickr/dist/types/options";
import { Instance as FlatpickrInstance  } from "flatpickr/dist/types/instance";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time" | "datetime";
  value?: FlatpickrOptions["defaultDate"];
  onChange?: (selectedDates: Date[], dateStr: string, instance: FlatpickrInstance) => void;
  label?: string;
  placeholder?: string;
  enableTime?: boolean;
  noCalendar?: boolean;
  time_24hr?: boolean;
  minuteIncrement?: number;
  hourIncrement?: number;
  defaultDate?: FlatpickrOptions["defaultDate"];
  defaultHour?: number;
  defaultMinute?: number;
};

export default function DatePicker({
  id,
  mode = "single",
  value,
  onChange,
  label,
  placeholder,
  enableTime = false,
  noCalendar = false,
  time_24hr = true,
  minuteIncrement = 1,
  hourIncrement = 1,
  defaultDate,
  defaultHour = 12,
  defaultMinute = 0,
}: PropsType) {
  const fpRef = useRef<FlatpickrInstance | null>(null);

  useEffect(() => {
    const isTimeMode = mode === "time";
    const isDateTimeMode = mode === "datetime";

    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with ID '${id}' not found for DatePicker.`);
      return;
    }

    // Fungsi untuk memastikan value yang valid
    const getValidDate = (dateValue: FlatpickrOptions["defaultDate"] | null | undefined) => {
      if (dateValue === null || dateValue === undefined || dateValue === '' || dateValue === 'null') {
        return undefined;
      }
      return dateValue;
    };

    const instance = flatpickr(element, {
      mode: isTimeMode || isDateTimeMode ? "single" : mode,
      dateFormat: isTimeMode
        ? "H:i"
        : isDateTimeMode
        ? "Y-m-d H:i"
        : "Y-m-d",
      defaultDate: getValidDate(value) ?? getValidDate(defaultDate),
      enableTime: enableTime || isTimeMode || isDateTimeMode,
      noCalendar: noCalendar || isTimeMode,
      time_24hr,
      minuteIncrement,
      hourIncrement,
      defaultHour,
      defaultMinute,
      onChange,
      appendTo: document.body,
      position: "auto",
    }) as FlatpickrInstance;

    fpRef.current = instance;

    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
        fpRef.current = null;
      }
    };
  }, [
    id,
    mode,
    onChange,
    enableTime,
    noCalendar,
    time_24hr,
    minuteIncrement,
    hourIncrement,
    defaultDate,
    defaultHour,
    defaultMinute,
  ]);

  useEffect(() => {
    if (!fpRef.current) return;

    // Penanganan yang lebih robust untuk nilai null/undefined/empty string
    if (value === null || value === undefined || value === '' || value === 'null') {
      fpRef.current.clear();
      return;
    }

    try {
      const currentPickerDate = fpRef.current.selectedDates[0];
      const newValueAsDate = new Date(value as string);

      // Pastikan tanggal valid
      if (isNaN(newValueAsDate.getTime())) {
        console.warn('Invalid date value provided to DatePicker:', value);
        fpRef.current.clear();
        return;
      }

      if (
        !currentPickerDate ||
        newValueAsDate.getTime() !== currentPickerDate.getTime()
      ) {
        fpRef.current.setDate(value, false);
      }
    } catch (error) {
      console.error('Error setting date in DatePicker:', error);
      fpRef.current.clear();
    }
  }, [value]);

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
    <div className="w-full">
      {label && (
        <Label htmlFor={id} className="block mb-1 text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          placeholder={getDefaultPlaceholder()}
          className="
            h-11 w-full rounded-lg border
            appearance-none px-4 py-2.5 text-sm shadow-theme-xs
            placeholder:text-gray-400 focus:outline-hidden focus:ring-3
            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
            bg-transparent text-gray-800 border-gray-300
            focus:border-brand-300 focus:ring-brand-500/20
            dark:border-gray-700 dark:focus:border-brand-800
          "
        />

        <span
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-gray-500 pointer-events-none dark:text-gray-400
          "
        >
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}