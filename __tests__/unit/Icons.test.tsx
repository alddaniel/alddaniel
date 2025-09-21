(() => {
/**
 * @fileoverview Unit tests for helper functions in Icons.tsx.
 * This demonstrates testing isolated, pure functions.
 */

// This is a workaround because the original component exports both React components and helper functions.
// In a real test setup with a bundler, we could import selectively. Here we assume we can access the functions.
const getInitials = (name: string = ''): string => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

const nameToColor = (name: string = ''): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 50%, 70%)`;
};


// Dummy test runner functions
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


describe('Icon Component Helpers', () => {

  describe('getInitials', () => {
    it('should return "U" for an empty or undefined name', () => {
      expect(getInitials('')).toBe('U');
      expect(getInitials(undefined as any)).toBe('U');
    });

    it('should return the first letter for a single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should return the initials of the first and last name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });
    
    it('should handle multiple names correctly', () => {
      expect(getInitials('John Fitzgerald Kennedy')).toBe('JK');
    });

    it('should handle extra spacing', () => {
      expect(getInitials('  Jane   Doe  ')).toBe('JD');
    });
  });

  describe('nameToColor', () => {
    it('should return a consistent color for the same name', () => {
      const color1 = nameToColor('Jane Doe');
      const color2 = nameToColor('Jane Doe');
      expect(color1).toBe(color2);
    });

    it('should return a different color for a different name', () => {
      const color1 = nameToColor('Jane Doe');
      const color2 = nameToColor('John Smith');
      // This is not a foolproof test, but highly likely to pass given the hashing.
      expect(color1 !== color2).toBe(true);
    });

    it('should return a valid HSL color string', () => {
      const color = nameToColor('Test');
      expect(color.startsWith('hsl(')).toBe(true);
      expect(color.endsWith(')')).toBe(true);
    });
  });

});
})();
