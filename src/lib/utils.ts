
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-500/20 text-green-300 border border-green-500/30';
    case 'inactive':
      return 'bg-red-500/20 text-red-300 border border-red-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  }
}

// Funzioni di validazione form
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Funzioni di manipolazione array per le interfacce admin
export function moveItemUp<T>(array: T[], index: number): T[] {
  if (index <= 0) return array;
  const newArray = [...array];
  const item = newArray[index];
  newArray[index] = newArray[index - 1];
  newArray[index - 1] = item;
  return newArray;
}

export function moveItemDown<T>(array: T[], index: number): T[] {
  if (index >= array.length - 1) return array;
  const newArray = [...array];
  const item = newArray[index];
  newArray[index] = newArray[index + 1];
  newArray[index + 1] = item;
  return newArray;
}
