(() => {
/**
 * @fileoverview End-to-End (E2E) test for the Customer Management flows.
 *
 * NOTE: This file is written with Cypress-like syntax and is for demonstration.
 * It would be run by a test runner like Cypress to automate browser interactions.
 */

// Dummy Cypress commands to allow for syntax writing.
const describe = (name: string, fn: () => void) => { console.log(`\n----- E2E Test Suite: ${name} -----`); fn(); };
const it = (name: string, fn: () => void) => { console.log(`  - E2E Scenario: ${name}`); fn(); };
const beforeEach = (fn: () => void) => { console.log(`\n  - E2E Hook: Running beforeEach`); fn(); };
const cy = {
  visit: (url: string) => console.log(`    - Visiting URL: ${url}`),
  get: (selector: string) => {
    console.log(`    - Getting element: ${selector}`);
    return {
      type: (text: string) => console.log(`      - Typing: "${text}"`),
      click: () => console.log(`      - Clicking element`),
      clear: () => console.log(`      - Clearing input`),
      select: (option: string) => console.log(`      - Selecting option: "${option}"`),
    };
  },
  contains: (selector: any, text?: string) => {
    const logText = text ? `'${selector}' containing text: "${text}"` : `element containing text: "${selector}"`;
    console.log(`    - Getting ${logText}`);
    return {
      click: () => console.log(`      - Clicking element`),
      should: (condition: string, value?: any) => {
        const message = value ? `'${condition}', with value '${value}'` : `'${condition}'`;
        console.log(`    - Asserting element should be ${message}`);
        return {
          find: (childSelector: string) => {
             console.log(`    - Finding child element '${childSelector}'`);
             return {
                click: () => console.log(`      - Clicking child element`),
             }
          }
        };
      },
      // FIX: Added the `find` method to the mock object returned by `cy.contains`.
      // This makes the mock compatible with the test case that calls `.find()` directly on the result of `cy.contains()`.
      find: (childSelector: string) => {
        console.log(`    - Finding child element '${childSelector}'`);
        return {
          click: () => console.log(`      - Clicking child element`),
        };
      },
    };
  },
};

// --- E2E Test Suite ---

describe('Customer Management Flow', () => {

  beforeEach(() => {
    // Before each test, simulate a login to ensure the user is authenticated.
    cy.visit('/');
    cy.get('input[name="email"]').type('ddarruspe@gmail.com');
    cy.get('input[name="password"]').type('1906');
    cy.get('button[type="submit"]').click();
    cy.contains('Painel').should('be.visible');
  });

  it('should allow adding a new customer', () => {
    // 1. Navigate to the customer page
    cy.visit('/#/customers');
    cy.contains('h1', 'Clientes').should('be.visible');

    // 2. Click the button to add a new customer
    cy.contains('Adicionar Cliente').click();

    // 3. Fill out the form
    cy.get('input[name="name"]').type('Nova Empresa de Teste E2E');
    cy.get('input[name="email"]').type('contato@teste-e2e.com');
    cy.get('select[name="type"]').select('Company');
    cy.get('input[name="identifier"]').type('11444777000161'); // Valid CNPJ
    cy.get('input[name="phone"]').type('99 1234 5678');
    
    // 4. Submit the form
    cy.get('button[type="submit"]').click();

    // 5. Verify the new customer is now in the list
    cy.contains('Nova Empresa de Teste E2E').should('be.visible');
    console.log('    - E2E scenario finished successfully.');
  });
  
  it('should allow editing an existing customer', () => {
    // 1. Navigate to the customer page
    cy.visit('/#/customers');

    // 2. Find the row for 'Global Imports' and click its edit button
    cy.contains('tr', 'Global Imports').find('button[title="Editar"]').click();

    // 3. Change the phone number in the modal
    cy.get('input[name="phone"]').clear();
    cy.get('input[name="phone"]').type('(99) 99999-9999');

    // 4. Save the changes
    cy.contains('button', 'Salvar Alterações').click();

    // 5. Verify the phone number has been updated in the table
    cy.contains('tr', 'Global Imports').should('contain', '(99) 99999-9999');
    console.log('    - E2E scenario finished successfully.');
  });

});
})();