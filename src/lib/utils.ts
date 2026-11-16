import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatTime(time: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeStyle: "short",
  }).format(new Date(time));
}

export function getCustomerAvatarSrc(gender?: string): string {
  const g = (gender || "").trim().toLowerCase();
  if (g === "male" || g === "m" || g === "man" || g === "boy") {
    return "/images/avatars/customer-male.jpg";
  }
  return "/images/avatars/customer-female.jpg";
}
