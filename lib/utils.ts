import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function compact(n: number) { return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n); }
export function dateLabel(date: string) { return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" }); }
