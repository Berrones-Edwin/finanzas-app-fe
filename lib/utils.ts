import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, subMonths } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const BACKEND_FORMAT = "yyyy-MM-dd'T'00:00:00";
export const getCurrentDate = () => format(new Date(), BACKEND_FORMAT);

export const getStartDate = () => format(subMonths(new Date(), 5), BACKEND_FORMAT);

export const toInputDate = (value: string) => value.slice(0, 10);

export const toBackendDate = (value: string) =>
  value ? `${value}T00:00:00` : '';