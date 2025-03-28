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
  return randomDate.toISOString().split("T")[0]
}