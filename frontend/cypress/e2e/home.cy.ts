describe('Home Page', () => {
  it('should load the home page', () => {
    cy.visit('/')
    cy.contains('Technical Blog').should('be.visible')
    cy.contains('Recent Blogs').should('be.visible')
    cy.contains('Popular Blogs').should('be.visible')
  })

  it('should display blog cards', () => {
    cy.visit('/')
    cy.get('.space-y-6 > .overflow-hidden').should('exist')
  })

  it('should navigate to blog post when clicking title', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().click()
    cy.url().should('include', '/blog/')
  })

  it('should show header navigation', () => {
    cy.visit('/')
    cy.contains('TechBlog').should('be.visible')
    cy.contains('Home').should('be.visible')
    
    // Check auth state and show appropriate button
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign In')) {
        cy.contains('Sign In').should('be.visible')
      } else {
        cy.contains('Write').should('be.visible')
      }
    })
  })
})