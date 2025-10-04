declare global {
  namespace Cypress {
    interface Chainable {
      loginSession(): Chainable<void>
      preserveAuth(): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginSession', () => {
  cy.session('email-auth', () => {
    cy.visit('/')
    
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign In')) {
        cy.contains('Sign In').click()
        cy.get('[role="dialog"]').should('be.visible')
        
        // Try login first
        cy.get('input[type="email"]').clear().type('xyz@gmail.com')
        cy.get('input[type="password"]').clear().type('xyz123')
        cy.get('button[type="submit"]').click()
        
        // Check if login succeeded
        cy.get('body', { timeout: 5000 }).then(($result) => {
          if ($result.text().includes('Sign In')) {
            // Login failed, try signup
            cy.log('Login failed, attempting signup')
            cy.contains('Don\'t have an account? Sign up').click()
            
            cy.get('input[type="email"]').clear().type('xyz@gmail.com')
            cy.get('input[type="password"]').clear().type('xyz123')
            cy.get('button[type="submit"]').click()
          }
        })
        
        cy.get('[role="dialog"]', { timeout: 15000 }).should('not.exist')
      }
    })
    
    cy.get('body').should('not.contain', 'Sign In')
    cy.contains('Write').should('be.visible')
  }, {
    validate() {
      cy.visit('/')
      cy.get('body').should('not.contain', 'Sign In')
      cy.contains('Write').should('be.visible')
    }
  })
})

Cypress.Commands.add('preserveAuth', () => {
  cy.session('preserve-auth', () => {
    cy.visit('/')
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign In')) {
        cy.log('No existing auth session - run loginSession first')
        throw new Error('Authentication required')
      }
    })
  })
})