import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomBytes } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateNonce() {
  return `${Date.now()}-${randomBytes(8).toString('hex')}`
}
