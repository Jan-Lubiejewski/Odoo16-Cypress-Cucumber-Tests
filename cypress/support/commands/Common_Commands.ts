const getAlert = () => cy.get('.alert');

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
  
  
  export const commonCommands = {
    assertAlert
  };