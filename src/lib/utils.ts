import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const safeFormat = (date: any, formatStr: string) => {
  try {
    if (!date) return "TBD";
    const d = (date?.toDate ? date.toDate() : new Date(date));
    if (isNaN(d.getTime())) return "TBD";
    return format(d, formatStr);
  } catch (e) {
    return "TBD";
  }
};
