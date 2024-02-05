import { Before, Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { admin } from '../../fixtures/test-data/User';
import '~Commands/Selector_Commands';

Before(() => {
  cy.visit('/web/login');
});

Given('I am on the login page', () => {
  cy.title().should('include', 'Odoo');
  cy.url().should('include', 'web/login');
});

Given('I am logged in as an {string}', (user: string) => {
  const userData = {
    admin
  }[user];

  if (!userData) {
    throw new Error(`Unknown user: ${user}`);
  }

  const { email, password } = userData;

  cy.getInputByLabel('Email').type(email);
  cy.getInputByLabel('Password').type(password);
  cy.getButtonByPartialText('Log in').click();
});

Then('I should remain on the login page', () => {
  cy.title().should('include', 'Odoo');
  cy.url().should('include', 'web/login');
});