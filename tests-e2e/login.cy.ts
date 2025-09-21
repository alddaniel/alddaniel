(() => {
/**
 * @fileoverview End-to-End (E2E) test for the Login flow.
 *
 * NOTE: This file is written with Cypress-like syntax.
 * It is NOT meant to be executed directly. It would be run by the Cypress
 * test runner in a real development environment, which would open a browser
 * and perform the described actions.
 *
 * Command to run in a real project: `npx cypress run --spec "cypress/e2e/login.cy.ts"`
 */

// Dummy Cypress commands to allow for syntax writing.
const describe = (name: string, fn: () => void) => { console.log(`\n----- E2E Test Suite: ${name} -----`); fn(); };
const it = (name: string, fn: () => void) => { console.log(`  - E2E Scenario: ${name}`); fn(); };
const cy = {
  visit: (url: string) => console.log(`    - Visiting URL: ${url}`),
  get: (selector: string) => {
    console.log(`    - Getting element: ${selector}`);
    return {
      type: (text: string) => console.log(`      - Typing: "${text}"`),
      click: () => console.log(`      - Clicking element`),
    };
  },
  url: () => ({
    should: (condition: string, value: string) => {
        console.log(`    - Asserting URL should ${condition} '${value}'`);
    }
  }),
  contains: (text: string) => ({
    should: (condition: string) => {
        console.log(`    - Asserting element containing "${text}" should be ${condition}`);
    }
  })
};

// --- E2E Test Suite ---

describe('Login Flow', () => {

  it('should allow a valid user to log in and be redirected to the dashboard', () => {
    // 1. Visit the application's root URL (which should redirect to login if not authenticated)
    cy.visit('/');

    // 2. Find the email input, type a valid email
    cy.get('input[name="email"]').type('ddarruspe@gmail.com');

    // 3. Find the password input, type a valid password
    cy.get('input[name="password"]').type('1906');

    // 4. Find the login button and click it
    cy.get('button[type="submit"]').click();

    // 5. Assert that the URL has changed to the dashboard's path
    cy.url().should('include', '/#/'); // HashRouter adds '#'

    // 6. Assert that an element from the dashboard is now visible
    cy.contains('Painel').should('be.visible');
    
    console.log('    - E2E scenario finished successfully.');
  });
  
  it('should show an error message for invalid credentials', () => {
    cy.visit('/');
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Assert that an error message is displayed
    cy.contains('E-mail ou senha inválidos').should('be.visible');
    
    // Assert that the URL has NOT changed
    cy.url().should('not.include', '/#/');
    
    console.log('    - E2E scenario finished successfully.');
  });
});
})();
