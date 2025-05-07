import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomImage(width: number, height: number) {
  return `https://picsum.photos/seed/${Math.random().toString(36).substring(2, 15)}/${width}/${height}`
}

export function getRandomDate() {
  const start = new Date(2020, 0, 1).getTime()
  const end = new Date(2030, 0, 1).getTime()
  const randomDate = new Date(start + Math.random() * (end - start))
  return randomDate;
}

/**
 * Check if a string is a valid UUID
 * @param id UUID to check
 * @returns True if the string is a valid UUID, false otherwise
 */
export function isUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(id);
  return isValid;
}
