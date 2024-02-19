import '~StepDefinitions/commands/Selector_Commands';

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { commonCommands } from './commands/Common_Commands'; //'~Commands/Common_Commands';

When(
    'I fill {string} into input with label {string} and id {string}',
    (value: string, labelText: string, id: string) => {
      cy.getInputByLabel(labelText).should('be.visible').and('have.attr', 'for', id);
      cy.getInputById(id).type(value);
    },
  );
  
  When(
    'I fill {string} into drop down input with label {string} and id {string}',
    (value: string, labelText: string, id: string) => {
      cy.getInputByLabel(labelText).should('be.visible').and('have.attr', 'for', id);
      cy.getInputById(id).type(value);
      cy.getByClass('dropdown') //
        .find('ul')
        .contains(value)
        .click();
    },
  );
  
  When('I click {string} on breadscrumb link', (breadscrumbLink: string) => {
    cy.getByClass('breadcrumb').contains(breadscrumbLink).click();
  });
  
  When('I click {string} button', (buttonName: string) => {
    cy.getButtonByPartialText(buttonName).click();
  });
  
  When('I click button with title {string}', (buttonTitle: string) => {
    cy.getButtonByTitle(buttonTitle).click();
  });
  
  When('I click {string} link', (linkText: string) => {
    cy.getLinkByText(linkText).click();
  });
  
  Then('I should see alert with error message {string}', (alertMessage: string) => {
    commonCommands.assertAlert('equals', alertMessage);
  });