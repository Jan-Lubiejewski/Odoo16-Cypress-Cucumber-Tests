import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { commonCommands } from '~Commands/Common_Commands';
import { formCommands } from '~Commands/Form_Commands';
import { navBarCommands } from '~Commands/NavBar_Commands';
import { User } from '~interfaces/User';

let user: User;

beforeEach(() => {
    user.email = 'test@outlook.com';
    user.name = 'Jan';
    user.password = '123456789';
});

Given('I am on Settings page', () => {
  navBarCommands.useDropDownMenu('Settings');
  commonCommands.assertActiveBreadcrumb('Settings');
});

When('I invite new user', () => {
  cy.getByPlaceholder('Enter e-mail address').type(user.email);
  cy.getButtonByPartialText('Invite').click();
  assertUserInPendingInvitations(user.email);
  cy.getButtonByPartialText('Manage Users').click();
  assertUserDisplayedInUsersList(user.email, 'Never Connected');
});

When('I register new user with set credentials', () => {
  cy.getByName('login').contains(user.email).click();
  commonCommands.assertAlert(
    'including',
    'An invitation email containing the following subscription link has been sent:',
  );

  formCommands.clearInputById('name');
  formCommands.clearInputById('login');
  formCommands.fillInputByLabel('Name', 'name', user.name);
  formCommands.fillInputByLabel('Email Address', 'login', user.email);
  cy.getButtonByPartialText('Save').click();

  clickInvitationLink();
  formCommands.fillInputByLabel('Password', 'password', user.password);
  formCommands.fillInputByLabel('Confirm Password', 'confirm_password', user.password);
  cy.getButtonByPartialText('Reset Password').click();
});

Then('I should be logged as registered user', () => {
  navBarCommands.assertLoggedUser(user.name);
});

const assertUserInPendingInvitations = (email: string) => {
  cy.contains('Pending Invitations:').parent('div').contains(email).should('be.visible');
};

const assertUserDisplayedInUsersList = (email: string, status: string) => {
  cy.getByName('login') //
    .contains(email)
    .should('be.visible')
    .as('userRow');
  cy.get('@userRow') //
    .parent('tr')
    .getByName('state')
    .first()
    .should('have.text', status);
};

const clickInvitationLink = () => {
  cy.getLinkByName('signup_url') //
    .invoke('removeAttr', 'target')
    .click();
};