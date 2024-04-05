import { getGreeting } from '../support/app.po'

describe('Todo App', () => {
  beforeEach(() => cy.visit('/'))

  it('adds todo', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.get('.input').type('harsh')
    cy.get('.add').click()
    cy.get('.todo-text')
      .invoke('text')
      .should('match', /^harsh/)
  })
})
