
/**
 * @fileoverview
 * This service centralizes business logic validation, such as for CPF and CNPJ.
 * In a production architecture, these functions would run on a secure backend server
 * to ensure data integrity, as frontend validation can be bypassed.
 */

const clean = (value: string = ''): string => value.replace(/\D/g, '');
const allSameDigits = (value: string): boolean => new Set(value.split('')).size === 1;

/**
 * Validates a Brazilian CNPJ number.
 * @param cnpj The CNPJ string to validate.
 * @returns {boolean} True if the CNPJ is valid, false otherwise.
 */
export const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = clean(cnpj);
    if (cleaned.length !== 14 || allSameDigits(cleaned)) return false;

    let size = 12;
    let numbers = cleaned.substring(0, size);
    const digits = cleaned.substring(size);
    let sum = 0;
    let pos = 5;
    
    for (let i = 0; i < size; i++) {
        sum += parseInt(numbers.charAt(i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0), 10)) return false;
    
    size = 13;
    numbers = cleaned.substring(0, size);
    sum = 0;
    pos = 6;
    for (let i = 0; i < size; i++) {
        sum += parseInt(numbers.charAt(i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1), 10);
};

/**
 * Validates a Brazilian CPF number.
 * @param cpf The CPF string to validate.
 * @returns {boolean} True if the CPF is valid, false otherwise.
 */
export const validateCPF = (cpf: string): boolean => {
    const cleaned = clean(cpf);
    if (cleaned.length !== 11 || allSameDigits(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i), 10) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i), 10) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleaned.charAt(10), 10);
};
