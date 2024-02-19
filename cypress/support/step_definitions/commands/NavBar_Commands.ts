const getDropdown = () => cy.get(".o_main_navbar [title='Home Menu']");
const getDropdownMenu = () => cy.get('.o-dropdown--menu');
const getDropdownItem = () => cy.get('.dropdown-item');
const getUserName = () => cy.get('.o_user_menu');

const useDropDownMenu = (category: string): void => {
  getDropdown().click();

  getDropdownMenu()
    .should('be.visible')
    .within(() => {
      getDropdownItem().contains(category).click();
    });
};

const assertLoggedUser = (userName: string): void => {
  getUserName().should('have.text', userName);
};

export const navBarCommands = {
  useDropDownMenu,
  assertLoggedUser,
};