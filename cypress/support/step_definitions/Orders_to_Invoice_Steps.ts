// Replace .waits() with intercepts waits

import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { contains } from 'cypress/types/jquery';
import dayjs from 'dayjs';

import { commonCommands } from '~Commands/Common_Commands';
import { formCommands } from '~Commands/Form_Commands';
import { helpersCommnds } from '~Commands/Helpers_Commands';
import { navBarCommands } from '~Commands/NavBar_Commands';
import { Invoice } from '~interfaces/Invoice';
import { Product } from '~interfaces/Product';
import { Quotation } from '~interfaces/Quotation';
import { QuotationTemplate } from '~interfaces/QuotationTemplate';

const today = dayjs().format('MM/DD/YYYY');
let quotationData: Quotation;
let quotationTemplateData: QuotationTemplate;
let invoice: Invoice;

before(() => {
  cy.fixture('test-data/QuotationDefault.json').then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    quotationData = data;
  });
  cy.fixture('test-data/QuotationTemplateDefault.json')
    .then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      quotationTemplateData = data;
    })
    .then(() => {
      invoice = {
        ...quotationData,
        ...quotationTemplateData,
        invoiceDate: today,
        salesDate: today,
      };
    });
});

Given('I am on Orders to Invoice page', () => {
  navBarCommands.useDropDownMenu('Sales');

  cy.getByClass('o_menu_sections').contains('To Invoice').click();
  cy.getByClass('o-dropdown--menu').contains('Orders to Invoice').click();

  cy.wait(8000);

  commonCommands.assertActiveBreadcrumb('Orders to Invoice');
});

When('I click on Order to Invoice with name {string}', (name: string) => {
  cy.getByName('name').contains(name).click();

  cy.wait(8000);

  commonCommands.assertActiveBreadcrumb(name);
});

When('I create invoice with {string} option set', (option: string) => {
  const { invoiceDate, salesDate } = invoice;

  cy.getButtonByPartialText('Create Invoice').click();

  cy.wait(8000);

  cy.getByClass('modal-content')
    .then((modalContent) => {
      cy.wrap(modalContent).find(`label:contains(${option})`).click();
      cy.wrap(modalContent).getButtonByPartialText('Create Draft Invoice').click();
    })
    .wait(8000)
    .then(() => {
      assertForm(invoice);

      formCommands.fillInputByLabel('Invoice Date', 'invoice_date_0', invoiceDate);
      formCommands.fillInputByLabel('Sales Date', 'invoice_date_due_0', salesDate);

      //clickSaveButton();
      cy.getButtonByPartialText('Confirm').click();
      cy.wait(8000);
    });
});

When('I send the invoice', () => {
  cy.getButtonByPartialText('Send & Print').click();
  cy.wait(9000);
  cy.get('button').then(($button) => {
    if($button.text().includes('Save')){
      cy.getButtonByPartialText('Save').click();
      cy.wait(9000);
    }
  });
  cy.getButtonByPartialText('Send & Print').eq(1).click();
  cy.wait(9000);
  // assertForwardedBadge();
});

When('I register payment', () => {
  cy.getButtonByPartialText('Register Payment').click();
  cy.wait(9000);
  cy.getByClass('modal-content').within(() => {
    cy.getButtonByPartialText('Create Payment').click();
    cy.wait(9000);
  });

  // cy.getByName('button_revert_forward').should('be.visible');
  cy.getByClass('text-bg-success').should('have.text', 'Paid');
  cy.getByClass('o_payment_label').should('include.text', today);
});

Then('Invoice should have {string} as active state', (expectedState: string) => {
  const states = ['Draft', 'Posted'];
  const notActiveState: string[] = states.filter((s) => s !== expectedState);

  cy.get('[aria-label="Current state"]').should('have.text', expectedState);
  notActiveState.forEach((state) => {
    cy.get('[aria-label="Current state"]').should('not.have.text', state);
  });
});

Then('Debit and credit amounts should add up', () => {
  cy.getByName('aml_tab').click();
  assertDebitCredit();
});

Then('Invoice should be created', () => {
  const { customer, name, invoiceDate } = invoice;

  cy.getByName('invoice_tab').click();
  let invoiceNumber: string;
  cy.get('div.oe_title span')
    .invoke('text')
    .then((text) => {
      invoiceNumber = text;
    });

  cy.getByName('invoice_tab').click();
  let invoiceTotal: string;
  cy.get('span[name="amount_total"]')
    .invoke('text')
    .then((text) => {
      invoiceTotal = text;
    });

  navBarCommands.useDropDownMenu('Invoicing');

  cy.getByClass('o_menu_sections').contains('Customers').click();
  cy.getByClass('o-dropdown--menu').contains('Invoices').click();

  cy.wait(8000);

  cy.get('tbody tr.o_data_row').each((row) => {
    cy.wrap(row)
      .find("td[name='name']")
      .invoke('text')
      .then((text) => {
        if (text.includes(invoiceNumber)) {
          cy.wrap(row).find("td[name='name']").should('have.text', name);

          cy.wrap(row).find("td[name='invoice_partner_display_name']").should('have.text', customer.name);

          cy.wrap(row).find("td[name='invoice_date']").should('have.text', invoiceDate);

          cy.wrap(row).find("td[name='amount_total_signed']").should('have.text', invoiceTotal);

          cy.wrap(row).find("td[name='amount_total_in_currency_signed']").should('have.text', invoiceTotal);

          cy.wrap(row).find("td[name='payment_state']").should('have.text', 'Paid');

          cy.wrap(row).find("td[name='state']").should('have.text', 'Posted');
        }
      });
  });
});

const assertForwardedBadge = () => {
  cy.get('.oe_title .badge')
    .invoke('text')
    .then((text) => {
      const badgeText = helpersCommnds.clearText(text);

      expect(badgeText).to.equal('Forwarded');
    });
};

const clickSaveButton = () => {
  cy.getButtonByPartialText('Save').click();
  cy.contains('Unsaved changes').should('not.be.visible');
};

const assertForm = (inv: Invoice) => {
  const { customer, paymentTerm, currency, products } = inv;

  cy.getInputById('partner_id_0').should('have.value', customer.name);
  cy.getByClass('o_field_many2one_extra')
    .should('include.text', customer.address.street)
    .should('include.text', customer.address.city)
    .should('include.text', customer.address.zip);

  // cy.getInputById('invoice_payment_term_id').should('have.value', paymentTerm); // No payment term set
  cy.getInputById('currency_id_1').should('have.value', currency.code);

  // Enable UOM filter -> maybe move it to features and check all req filters are enabled?
  // No such filter in this Ivoice Draft
  // cy.get('.o_optional_columns_dropdown_toggle').click();
  // cy.get('[name="product_uom_id"]').click();

  products.forEach((product: Product, index: number) => {
    const { productName, name, unitPrice, productUomQty, productUom, tax } = product;
    const curr = invoice.currency.symbol;

    cy.getByClass('o_data_row')
      .eq(index)
      .within(() => {
        cy.getByName('product_id').first().should('have.text', productName);
        cy.get('td').getByName('name').should('have.text', name); // Label
        cy.getByName('quantity').should('have.text', productUomQty.toFixed(2));
        // cy.getByName('product_uom_id').should('have.text', productUom);
        cy.getByName('price_unit').should('have.text', unitPrice.toFixed(2));
        cy.get('div[name="tax_ids"]').invoke('text').should('be.oneOf', [tax, '']); // span is not created when empty ''
        assertSubtotal(curr);
      });
  });
};

const assertSubtotal = (curr: string) => {
  let quantity: number;
  let priceUnit: number;

  cy.getByName('quantity')
    .invoke('text')
    .then((value) => {
      quantity = Number(value);
    });
  cy.getByName('price_unit')
    .invoke('text')
    .then((value) => {
      priceUnit = Number(value);
    });

  cy.getByName('price_subtotal')
    .invoke('text')
    .then((subtotal) => {
      const subtotalValue = `${curr} ${(quantity * priceUnit).toFixed(2)}`;
      const elementSubtotal = helpersCommnds.clearText(subtotal);

      expect(elementSubtotal).to.equal(subtotalValue);
    });
};

const assertDebitCredit = () => {
  let debitSum = 0;
  let creditSum = 0;

  cy.getByClass('o_data_row').each(($row) => {
    const debitText = $row.find('[name="debit"]').text();
    const creditText = $row.find('[name="credit"]').text();

    const debitValue = parseFloat(debitText);
    if (!Number.isNaN(debitValue)) {
      debitSum += debitValue;
    }
    const creditValue = parseFloat(creditText);
    if (!Number.isNaN(creditValue)) {
      creditSum += creditValue;
    }
  });
  cy.getByTooltip('Total Debit')
    .invoke('text')
    .then((tooltipText) => {
      const totalDebit = parseFloat(tooltipText.trim());
      expect(totalDebit).to.equal(debitSum);
    });
  cy.getByTooltip('Total Credit')
    .invoke('text')
    .then((tooltipText) => {
      const totalCredit = parseFloat(tooltipText.trim());
      expect(totalCredit).to.equal(creditSum);
    });
};
