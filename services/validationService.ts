/**
 * @fileoverview Service for validating Brazilian document numbers (CPF and CNPJ).
 */

/**
 * Validates a Brazilian CPF number.
 * @param cpf The CPF string, which can be formatted or unformatted.
 * @returns True if the CPF is valid, false otherwise.
 */
export const validateCPF = (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');

    if (cpfClean.length !== 11 || /^(\d)\1{10}$/.test(cpfClean)) {
        return false;
    }

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpfClean.substring(i - 1, i), 10) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }

    if (remainder !== parseInt(cpfClean.substring(9, 10), 10)) {
        return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpfClean.substring(i - 1, i), 10) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }

    return remainder === parseInt(cpfClean.substring(10, 11), 10);
};

/**
 * Validates a Brazilian CNPJ number.
 * @param cnpj The CNPJ string, which can be formatted or unformatted.
 * @returns True if the CNPJ is valid, false otherwise.
 */
export const validateCNPJ = (cnpj: string): boolean => {
    const cnpjClean = cnpj.replace(/[^\d]/g, '');

    if (cnpjClean.length !== 14 || /^(\d)\1{13}$/.test(cnpjClean)) {
        return false;
    }

    let length = cnpjClean.length - 2;
    let numbers = cnpjClean.substring(0, length);
    const digits = cnpjClean.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i), 10) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0), 10)) {
        return false;
    }

    length = length + 1;
    numbers = cnpjClean.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i), 10) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1), 10);
};

/**
 * Validates an Argentinian DNI number (basic length check).
 * @param dni The DNI string.
 * @returns True if the DNI has a valid length, false otherwise.
 */
export const validateDNI = (dni: string): boolean => {
    const dniClean = dni.replace(/[^\d]/g, '');
    // Basic validation for 7 or 8 digits
    return dniClean.length === 7 || dniClean.length === 8;
};

/**
 * Validates an Argentinian CUIT number.
 * @param cuit The CUIT string, which can be formatted or unformatted.
 * @returns True if the CUIT is valid, false otherwise.
 */
export const validateCUIT = (cuit: string): boolean => {
    const cuitClean = cuit.replace(/[^\d]/g, '');
    if (cuitClean.length !== 11) {
        return false;
    }
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cuitClean[i], 10) * multipliers[i];
    }
    const remainder = sum % 11;
    let verifier = 11 - remainder;
    if (verifier === 11) {
        verifier = 0;
    }
    if (verifier === 10) {
        return false;
    }
    return verifier === parseInt(cuitClean[10], 10);
};

const ARGENTINIAN_PROVINCE_CODES = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

/**
 * Validates an Argentinian Postal Code (CPA).
 * Format: XNNNNLLL where X is a province letter, N is a digit, L is a letter.
 * @param cpa The CPA string.
 * @returns True if the CPA is valid, false otherwise.
 */
export const validateCPA = (cpa: string): boolean => {
    const cpaClean = cpa.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]\d{4}[A-Z]{3}$/.test(cpaClean)) {
        return false;
    }
    const provinceCode = cpaClean.charAt(0);
    return ARGENTINIAN_PROVINCE_CODES.includes(provinceCode);
};


// This ensures the file is treated as a module.
export {};