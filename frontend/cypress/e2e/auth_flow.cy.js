describe('Header shows user state (desktop)', () => {
  it('shows welcome message after login', () => {
    cy.viewport(1280, 800); // Desktop size
    cy.visit('localhost:3000/login');
    cy.get('input[name="email"]').type('kingkong567@hotmail.com');
    cy.get('input[name="password"]').type('test123');
    cy.get('button[type="submit"]').contains(/login/i).click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
});


describe('Header shows user state (mobile)', () => {
  it('shows user info in mobile menu after login', () => {
    cy.viewport(393,852); // iphone 15 and 16
    cy.visit('localhost:3000/login');
    cy.get('input[name="email"]').type('kingkong567@hotmail.com');
    cy.get('input[name="password"]').type('test123');
    cy.get('button[type="submit"]').contains(/login/i).click();
    cy.url().should('include', '/dashboard');

    // Open the mobile menu/account dropdown
    cy.get('button[aria-label="Menu"]').click();

    // Now assert the user info is visible
    cy.contains('test test').should('be.visible');
  });
});



