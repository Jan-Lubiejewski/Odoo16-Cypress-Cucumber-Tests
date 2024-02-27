import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { formCommands } from '~Commands/Form_Commands';
import { helpersCommnds } from '~Commands/Helpers_Commands';
import { navBarCommands } from '~Commands/NavBar_Commands';
import { Product } from '~interfaces/Product';
import { QuotationTemplate } from '~interfaces/QuotationTemplate';

let quotationTempateData: QuotationTemplate;

beforeEach(() => {
  cy.fixture('test-data/QuotationTemplateDefault.json').then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    quotationTempateData = data;
  });
});

Given('I am on Quotation Templates Page', () => {
  navBarCommands.useDropDownMenu('Sales');

  cy.getByClass('o_menu_sections').contains('Products').click();
  cy.getByClass('o-dropdown--menu').contains('Quotation Templates').click();

  cy.getByClass('breadcrumb').should('have.text', 'Quotation Templates');
});

When('I fill Quotation Template form and save', () => {
  const { name, numberOfDays, mailTemplateId, clientName, projectName, projectManager, currency, products } =
    quotationTempateData;

  formCommands.fillInputByLabel('Quotation Template', 'client_id', name);
  formCommands.fillInputWithDropdownByLabel('Client', 'client_id', clientName);
  formCommands.fillInputWithDropdownByLabel('Project', 'project_id', projectName);
  cy.getByName('project_manager_id').should('have.text', projectManager);
  addProducts(products);
  clickSaveButton();
});

Then('I should see added Quotation Template inside table', () => {
  const { name, clientName, projectName, projectManager } = quotationTempateData;

  cy.get('tbody tr.o_data_row').each((row) => {
    cy.wrap(row)
      .find("td[name='name']")
      .invoke('text')
      .then((text) => {
        if (text.includes(name)) {
          cy.wrap(row).find("td[name='client_id']").should('have.text', clientName);

          cy.wrap(row).find("td[name='project_id']").should('have.text', projectName);

          cy.wrap(row).find("td[name='project_manager_id']").should('have.text', projectManager);
        }
      });
  });
});

const addProducts = (products: Product[]) => {
  products.forEach((product: Product, index: number) => {
    const { name, rateType, unitPrice, overtime } = product;
    cy.contains('Add a product').click();
    cy.get('td[name="product_id"] input:first').type(name);
    cy.contains(name).click();
    cy.get('td[name="rate_type"]').eq(index).click();
    cy.get('select.o_input').select(`${rateType}`);
    helpersCommnds.clickOutside();

    cy.get('td[name="rate_type"]').eq(index).should('have.text', rateType);
    cy.get('td[name="unit_price"]').eq(index).should('have.text', unitPrice.toFixed(2));
    cy.get('td[name="overtime"]').eq(index).should('have.text', overtime.toFixed(2));
  });
};

const clickSaveButton = () => {
  cy.intercept('/web/dataset/call_kw/sale.order.template/create').as('createTemplate');
  cy.get('button').contains('Save').click();
  cy.wait('@createTemplate');
};