/**
 * Formats a numeric value into Brazilian Real currency string.
 * Example: 38500 -> "R$ 38.500"
 */
export function formatBRL(value: number, includeDecimals = false): string {
  if (isNaN(value)) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Parses raw text input into clean integer currency amount.
 * Strips non-digit characters.
 */
export function parseBRLInput(input: string): number {
  const digitsOnly = input.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  return parseInt(digitsOnly, 10);
}
