/**
 * @fileoverview Unit tests for the validationService.
 *
 * NOTE: In a real project, this file would be placed in a `__tests__` directory
 * and run using a test runner like Jest or Vitest.
 * Example command: `npm test -- validationService.test.ts`
 */

import { validateCPF, validateCNPJ } from '../../services/validationService';

// The following are dummy functions to allow the test syntax to be written.
// A real test environment would provide these.
const describe = (name: string, fn: () => void) => { console.log(`\n----- Running suite: ${name} -----`); fn(); };
const it = (name: string, fn: () => void) => { console.log(`  - Running test: ${name}`); fn(); };
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      console.error(`    [FAIL] Expected ${actual} to be ${expected}`);
    } else {
      console.log(`    [PASS] Assertion passed.`);
    }
  }
});


describe('validationService', () => {

  describe('validateCPF', () => {
    it('should return true for a valid CPF', () => {
      // A valid CPF number generated for testing purposes
      const validCPF = '11144477735';
      expect(validateCPF(validCPF)).toBe(true);
    });

    it('should return false for an invalid CPF', () => {
      const invalidCPF = '12345678900';
      expect(validateCPF(invalidCPF)).toBe(false);
    });

    it('should return false for a CPF with all same digits', () => {
      const allSameDigitsCPF = '11111111111';
      expect(validateCPF(allSameDigitsCPF)).toBe(false);
    });

    it('should return false for a CPF with incorrect length', () => {
      const shortCPF = '1234567890';
      expect(validateCPF(shortCPF)).toBe(false);
    });
    
    it('should handle formatted CPF strings', () => {
        const formattedValidCPF = '111.444.777-35';
        expect(validateCPF(formattedValidCPF)).toBe(true);
    });
  });

  describe('validateCNPJ', () => {
    it('should return true for a valid CNPJ', () => {
      // A valid CNPJ number generated for testing purposes
      const validCNPJ = '11444777000161';
      expect(validateCNPJ(validCNPJ)).toBe(true);
    });

    it('should return false for an invalid CNPJ', () => {
      const invalidCNPJ = '12345678000190';
      expect(validateCNPJ(invalidCNPJ)).toBe(false);
    });

    it('should return false for a CNPJ with all same digits', () => {
      const allSameDigitsCNPJ = '11111111111111';
      expect(validateCNPJ(allSameDigitsCNPJ)).toBe(false);
    });

    it('should return false for a CNPJ with incorrect length', () => {
      const shortCNPJ = '1234567800019';
      expect(validateCNPJ(shortCNPJ)).toBe(false);
    });
    
     it('should handle formatted CNPJ strings', () => {
        const formattedValidCNPJ = '11.444.777/0001-61';
        expect(validateCNPJ(formattedValidCNPJ)).toBe(true);
    });
  });

});