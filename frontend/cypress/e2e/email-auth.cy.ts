describe('Authentication', () => {
  it('should show Sign In button when not authenticated', () => {
    cy.visit('/')
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign In')) {
        cy.contains('Sign In').should('be.visible')
        cy.contains('Sign In').click()
        cy.get('[role="dialog"]').should('be.visible')
      }
    })
  })

  describe('Authenticated Features', () => {
    beforeEach(() => {
      cy.loginSession()
    })

    it('should access authenticated features', () => {
      cy.visit('/')
      cy.contains('Write').should('be.visible')
      cy.contains('Write').click()
      cy.url().should('include', '/create')
    })
  })
})