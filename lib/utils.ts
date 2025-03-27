import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomImage(width: number, height: number) {
  return `https://picsum.photos/seed/${Math.random().toString(36).substring(2, 15)}/${width}/${height}`
}