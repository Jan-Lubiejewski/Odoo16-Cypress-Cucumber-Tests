const fillInputByLabel = (labelText: string, id: string, value: string | boolean) => {
    cy.log(id);
    if (typeof value !== 'undefined' && typeof value !== 'boolean') {
      cy.wait(1000).get(`#${id}`).type(value);
      cy.getInputById(id).trigger('blur');
    } else if (value === true) {
      cy.getInputByLabel(labelText).should('be.visible').and('have.attr', 'for', id);
      cy.getInputById(id).check();
    }
  };
  
  const fillInputWithDropdownByLabel = (labelText: string, id: string, value: string) => {
    if (typeof value !== 'undefined' && typeof value !== 'boolean') {
      cy.getInputByLabel(labelText).should('be.visible').and('have.attr', 'for', id);
      cy.getInputById(id).clear();
      cy.getInputById(id).type(value);
      cy.getInputById(id).click(); // click enables dropdown
      cy.wait(2500);
      cy.get('a').then(($elements) => {
        if ($elements.length <= 42 ) {
          cy.wait(1000);
          cy.getInputById(id).click();
        }
      });
      cy.get('a')
        .contains(new RegExp(`^${value}$`))
        .should('exist')
        .should('be.visible')
        .click();
  
      cy.getInputById(id).trigger('blur');
    }
  };
  
  const clearInputById = (id: string) => {
    cy.getInputById(id).clear();
    cy.getInputById(id).should('have.value', '');
  };
  
  export const formCommands = {
    fillInputByLabel,
    clearInputById,
    fillInputWithDropdownByLabel,
  };