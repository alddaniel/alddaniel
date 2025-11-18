/**
 * @fileoverview Service for applying input masks (CPF, CNPJ, etc.).
 */

/**
 * Applies a CPF mask (###.###.###-##) to a string of digits.
 * @param value The string to mask.
 * @returns The masked string.
 */
export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '') // Remove non-digits
    .replace(/(\d{3})(\d)/, '$1.$2') // Add first dot
    .replace(/(\d{3})(\d)/, '$1.$2') // Add second dot
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Add hyphen
    .substring(0, 14); // Limit length
};

/**
 * Applies a CNPJ mask (##.###.###/####-##) to a string of digits.
 * @param value The string to mask.
 * @returns The masked string.
 */
export const maskCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '') // Remove non-digits
    .replace(/(\d{2})(\d)/, '$1.$2') // Add first dot
    .replace(/(\d{3})(\d)/, '$1.$2') // Add second dot
    .replace(/(\d{3})(\d)/, '$1/$2') // Add slash
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2') // Add hyphen
    .substring(0, 18); // Limit length
};

/**
 * Applies a CUIT mask (##-########-#) to a string of digits (for Argentina).
 * @param value The string to mask.
 * @returns The masked string.
 */
export const maskCUIT = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1-$2')
        .replace(/(\d{8})(\d{1,1})$/, '$1-$2')
        .substring(0, 13);
};
