describe('Blog Features', () => {
  beforeEach(() => {
    cy.loginSession()
  })
  it('should display blog post elements', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().then(($link) => {
      const href = $link.attr('href')
      cy.visit(href)
      cy.get('h1').should('be.visible')
      cy.get('.flex.items-center.space-x-4').should('be.visible') // author info
      cy.get('.prose').should('be.visible') // blog content
    })
  })

  it('should display engagement metrics', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().then(($link) => {
      const href = $link.attr('href')
      cy.visit(href)
      
      // Check blog title
      cy.get('h1').should('be.visible').and('not.be.empty')
      
      // Check views with eye icon
      cy.get('svg[class*="lucide-eye"]').parent().should('be.visible')
      
      // Check like count with heart icon
      cy.get('svg[class*="lucide-heart"]').parent().should('be.visible')
    })
  })

  it('should display comments section', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().then(($link) => {
      const href = $link.attr('href')
      cy.visit(href)
      cy.contains('Comments').should('be.visible')
    })
  })

  it('should show share button', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().then(($link) => {
      const href = $link.attr('href')
      cy.visit(href)
      cy.contains('Share').should('be.visible')
    })
  })

  it('should show like button when authenticated', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().then(($link) => {
      const href = $link.attr('href')
      cy.visit(href)
      cy.get('svg[class*="lucide-heart"]').parent().should('be.visible')
    })
  })

  it('should show comment form when authenticated', () => {
    cy.visit('/')
    cy.get('a[href*="/blog/"]').first().then(($link) => {
      const href = $link.attr('href')
      cy.visit(href)
      cy.get('textarea[placeholder*="Write a comment"]').should('be.visible')
    })
  })
})