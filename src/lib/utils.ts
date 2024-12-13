import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDayAgo(): Date {
  const dayAgo = new Date();
  dayAgo.setHours(dayAgo.getHours() - 24);
  return dayAgo;
}
