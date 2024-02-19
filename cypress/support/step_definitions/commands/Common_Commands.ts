const getAlert = () => cy.get('.alert');

const assertPage = (title: string, url: string): void => {
  cy.getByClass('breadcrumb').should('have.text', title);
  cy.url().should('include', url);
};

const assertAlert = (option: 'including' | 'equals', alertText: string) => {
    return getAlert()
      .should('be.visible')
      .then((alert) => {
        // remove all spaces in the beginning and end of the string
        const text = alert.text().replace(/^\s+|\s+$/g, '');
  
        if (option === 'including') {
          expect(text).to.include(alertText);
        } else {
          expect(text).to.equal(alertText);
        }
      });
  };
  
  const assertActiveBreadcrumb = (text: string) => {
    cy.getByClass('o_last_breadcrumb_item').should('have.text', text);
  };
  
  export const commonCommands = {
    assertPage,
    assertAlert,
    assertActiveBreadcrumb,
  };