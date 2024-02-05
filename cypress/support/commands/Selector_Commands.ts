  Cypress.Commands.add('getInputByLabel', { prevSubject: ['optional'] }, (subject: void | string, labelText: string) => {
    return subject ? cy.wrap(subject).find(`label:contains("${labelText}")`) : cy.get(`label:contains("${labelText}")`);
  });

  Cypress.Commands.add('getInputById', { prevSubject: ['optional'] }, (subject: void | string, id: string) => {
    const selector = `input#${id}`;
    return subject ? cy.wrap(subject).find(selector) : cy.get(selector);
  });

  Cypress.Commands.add('getByClass', { prevSubject: ['optional'] }, (subject: void | string, className: string) => {
    return subject ? cy.wrap(subject).find(`.${className}`) : cy.get(`.${className}`);
  });

  Cypress.Commands.add('getButtonByPartialText', { prevSubject: ['optional'] }, (subject: void | string, buttonText: string) => {
    return subject ? cy.wrap(subject).find(`button:contains("${buttonText}")`) : cy.get(`button:contains("${buttonText}")`);
  });

  Cypress.Commands.add('getButtonByTitle', { prevSubject: ['optional'] }, (subject: void | string, btnTitle: string) => {
    return subject ? cy.wrap(subject).find(`button[title="${btnTitle}"`) : cy.get(`button[title="${btnTitle}"`);
  });

  Cypress.Commands.add('getLinkByText', { prevSubject: ['optional'] }, (subject: void | string, linkText: string) => {
    return subject ? cy.wrap(subject).find(`a:contains("${linkText}")`) : cy.get(`a:contains("${linkText}")`);
  });