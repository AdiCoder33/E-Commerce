type ClassValue = string | number | null | undefined | false;

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ');
}
