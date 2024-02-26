import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { formCommands } from '~Commands/Form_Commands';
import { helpersCommnds } from '~Commands/Helpers_Commands';
import { navBarCommands } from '~Commands/NavBar_Commands';
import { Product } from '~interfaces/Product';
import { Addres, Quotation, RoleData, UserAvailability } from '~interfaces/Quotation';
import { QuotationTemplate } from '~interfaces/QuotationTemplate';

let quotationData: Quotation;
let quotationTemplateData: QuotationTemplate;

// Uncaught RPC_ERROR: Odoo Server Error
before(() => {
  Cypress.on('uncaught:exception', () => false);
});

beforeEach(() => {
  cy.fixture('test-data/QuotationDefault').then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    quotationData = data;
  });
  cy.fixture('test-data/QuotationTemplateDefault').then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    quotationTemplateData = data;
  });
});

Given('I am on Quotations Page', () => {
  navBarCommands.useDropDownMenu('Sales');

  cy.getByClass('o_menu_sections').contains('Orders').click();
  cy.getByClass('o-dropdown--menu').contains('Quotations').click();
  cy.wait(8000);
});

When('I fill Quotation without Quotation Template and save', () => {
  const { customer, invoicePeriod, pricelist, paymentTerm } = quotationData;
  const { products } = quotationTemplateData;

  cy.wait(8000);

  formCommands.fillInputWithDropdownByLabel('Customer', 'partner_id_0', customer.name);
  formCommands.fillInputByLabel('Invoice Period', 'validity_date_0', invoicePeriod);

  formCommands.fillInputWithDropdownByLabel('Payment Terms', 'payment_term_id_0', paymentTerm);

  addProducts(products);
  assertAddress(customer.address);
  clickSaveButton();
  //assertMessage('Sales Order created');
});

When(/^I fill Quotation with (.+) Quotation Template and save$/, (quotationTemplate: string) => {
  const quotationFixture = `test-data/Quotation${quotationTemplate}`;
  const templateFixture = `test-data/QuotationTemplate${quotationTemplate}`;

  cy.wait(8000);

  cy.fixture(quotationFixture).then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    quotationData = data;
  });

  cy.fixture(templateFixture)
    .then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      quotationTemplateData = data;
    })
    .then(() => {
      const { customer, saleOrderTemplate, invoicePeriod, pricelist, paymentTerm } = quotationData;
      const { products } = quotationTemplateData;

      formCommands.fillInputWithDropdownByLabel('Customer', 'partner_id_0', customer.name);
      formCommands.fillInputWithDropdownByLabel('Quotation Template', 'sale_order_template_id_0', saleOrderTemplate);
      formCommands.fillInputByLabel('Invoice Period', 'validity_date_0', invoicePeriod);
      formCommands.fillInputWithDropdownByLabel('Payment Terms', 'payment_term_id_0', paymentTerm);

      assertProducts(products);

      assertAddress(customer.address);
      clickSaveButton();
      //assertMessage('Sales Order created');
    });
});

When('I send Quotation by email', () => {
  cy.getButtonByPartialText('Send by Email').click();
  cy.wait(8000);
  cy.getByClass('modal-content').getButtonByPartialText('Send').click();
  cy.wait(8000);

  assertCurrentState('Sales Order');
});

When('I click Quotation with name {string}', (name: string) => {
  cy.getByName('name').contains(name).click();
});

When('I confirm Quotation', () => {
  cy.intercept('POST', '/mail/thread/data').as('postRequest');

  cy.getButtonByPartialText('Confirm').then(($button) => {
    if ($button.is(':disabled')) {
      cy.wait('@postRequest');
    }
  });
  cy.getButtonByPartialText('Confirm').click();
});

Then(/^Quotation's Total Price should be valid with VAT rate (.+)$/, (vatRateString: string) => {
  let VAT_RATE: number;

  if (vatRateString.toLowerCase() === 'vat-np') {
    VAT_RATE = 0;
  } else if (vatRateString === '15%') {
    VAT_RATE = 0.15;
  }
  cy.get('td[name="price_subtotal"]').then((elements) => {
    const untaxedAmountSum = Array.from(elements).reduce((sum, element) => {
      const elementText = element.textContent ?? '';
      const numericMatches = elementText.match(/[0-9.,-]+/g);

      if (numericMatches) {
        return numericMatches.reduce((innerSum, match) => {
          const elementValue = parseFloat(match.replace(',', '')) || 0;
          return innerSum + elementValue;
        }, sum);
      }

      return sum;
    }, 0);

    const untaxedAmount = untaxedAmountSum.toFixed(2);
    const vatAmount = (untaxedAmountSum * VAT_RATE).toFixed(2);
    const totalPrice = (untaxedAmountSum + parseFloat(vatAmount)).toFixed(2);

    cy.getByName('Untaxed Amount')
      .invoke('text')
      .then((text) => {
        const formattedUntaxedAmount = extractNumbers(text);
        cy.wrap(formattedUntaxedAmount).should('eq', untaxedAmount);
      });

    cy.getByClass('o_tax_group_amount_value')
      .invoke('text')
      .then((text) => {
        const formattedVatAmount = extractNumbers(text);
        cy.wrap(formattedVatAmount).should('eq', vatAmount);
      });

    cy.getByName('amount_total')
      .invoke('text')
      .then((text) => {
        const formattedTotalPrice = extractNumbers(text);
        cy.wrap(formattedTotalPrice).should('eq', totalPrice);
      });
  });
});

Then('I should see added Quotation inside table', () => {
  const { customer, invoicePeriod, salesperson } = quotationData;

  let quotationNumber: string;

  cy.getTabByText('Order Lines').click();
  cy.get('div.oe_title span')
    .invoke('text')
    .then((text) => {
      quotationNumber = text;
    });

  cy.getByClass('breadcrumb').contains('Quotations').click();
  cy.getByClass('breadcrumb').should('have.text', 'Quotations');

  cy.get('tbody tr.o_data_row').each((row) => {
    cy.wrap(row)
      .find("td[name='name']")
      .invoke('text')
      .then((text) => {
        if (text.includes(quotationNumber)) {
          cy.wrap(row).find("td[name='invoice_period_short']").should('have.text', invoicePeriod.slice(3));

          cy.wrap(row).find("td[name='partner_id']").should('have.text', customer.name);

          cy.wrap(row).find("td[name='user_id']").should('have.text', salesperson);

          cy.wrap(row)
            .find("td[name='state']")
            .invoke('text')
            .should('be.oneOf', ['Quotation', 'Quotation Sent', 'Sales Order']);
        }
      });
  });
});

Then('Mismatching role should be marked in red and net price set to 0', () => {
  const TARGET_USER = 'Rafael Rodrigues';

  cy.getTabByText('Hours List').click();
  cy.get('tbody tr.o_data_row').each((row) => {
    cy.wrap(row)
      .find("td[name='user_name']")
      .invoke('text')
      .then((text) => {
        if (text.includes(TARGET_USER)) {
          cy.wrap(row).should('have.class', 'text-danger');

          cy.wrap(row)
            .find("td[name='net_price']")
            .invoke('text')
            .then((netPriceText) => {
              const currencySymbol = netPriceText.split(' ')[1];

              cy.wrap(row).find("td[name='net_price']").should('have.text', '0.00 ${currencySymbol}');
            });
        }
      });
  });
});

Then(/Availability and net price should be calculated correctly for (\d+) hours/, (hours: string) => {
  const monthlyHours = parseFloat(hours);
  const percent = 100;
  const availableHours = monthlyHours;

  dismissHoursWarning();
  cy.getTabByText('Hours List').click();
  dismissHoursWarning();
  cy.get('tbody tr.o_data_row').each((row) => {
    cy.wrap(row)
      .find("td[name='total_worked_hours']")
      .invoke('text')
      .then((totalWorkedHoursText) => {
        const totalWorkedHours = parseFloat(totalWorkedHoursText);

        const expectedAvailability = Math.round((totalWorkedHours / availableHours) * percent);

        cy.wrap(row)
          .find("td[name='availability']")
          .invoke('text')
          .then((availabilityText) => {
            const availability = parseFloat(availabilityText.replace('%', ''));

            expect(availability).to.equal(expectedAvailability);
          });
      });
  });
  assertHourListTab(String(hours));
});

Then(/Overtime subtotals should be calculated correctly for (\d+) hours/, (hours: string) => {
  const roleDataMap: Record<string, RoleData> = {};

  dismissHoursWarning();
  cy.getTabByText('Order Lines').click();
  dismissHoursWarning();
  cy.get('tbody tr.o_data_row').each((row) => {
    // eslint-disable-next-line no-shadow
    cy.wrap(row).then((row) => {
      const { role, isOvertimeRow } = getRoleAndCheckOvertime(row);

      roleDataMap[role] = roleDataMap[role] || {
        isOvertime: false,
        unitPrice: 1,
        quantity: 0,
        subTotal: '0.00',
        role: 'Lorem Ipsum',
      };
      roleDataMap[role].isOvertime = isOvertimeRow;
      roleDataMap[role].unitPrice = parseFloat(row.find("td[name='price_unit']").text());
      roleDataMap[role].quantity = parseFloat(row.find("td[name='product_uom_qty']").text());

      if (!isOvertimeRow && roleDataMap[role].quantity > 0) {
        roleDataMap[role].baseOvertimeRate = parseFloat(row.find("td[name='overtime']").text());
      }
    });
  });

  cy.get('tbody tr.o_data_row').each((row) => {
    // eslint-disable-next-line no-shadow
    cy.wrap(row).then((row) => {
      const { role, isOvertimeRow } = getRoleAndCheckOvertime(row);

      if (!isOvertimeRow) {
        return;
      }

      const baseRole = role.replace(' - overtime', '');
      const expectedSubtotal =
        roleDataMap[baseRole].baseOvertimeRate * roleDataMap[baseRole].unitPrice * roleDataMap[role].quantity;

      const displayedSubtotalText = row.find("td[name='price_subtotal']").text();
      const displayedSubtotal = parseFloat(displayedSubtotalText.replace(/[^0-9.-]+/g, ''));

      cy.wrap(expectedSubtotal).should('be.equal', displayedSubtotal);
    });
  });
  assertRoleData(String(hours));
});

const assertAddress = (address: Addres) => {
  cy.getByName('partner_id').scrollIntoView();
  cy.getByName('partner_id').then(($partnerId) => {
    cy.wrap($partnerId).within(() => {
      cy.contains(address.street).should('be.visible');
      cy.contains(address.city).should('be.visible');
      cy.contains(address.zip).should('be.visible');
    });
  });
};

const assertProducts = (products: Product[]) => {
  products.forEach((product, index) => {
    const { productName, name, productUomQty, productUom, unitPrice, tax } = product;

    cy.getByName('order_line').within(() => {
      cy.get('td[name="product_template_id"]').eq(index).should('have.text', productName);
      cy.get('td[name="name"]').eq(index).should('have.text', name);
      cy.get('td[name="product_uom_qty"]').eq(index).should('have.text', productUomQty.toFixed(2));
      // cy.get('td[name="product_uom"]').eq(index).should('have.text', productUom);
      cy.get('td[name="price_unit"]')
        .eq(index)
        .invoke('text') // Retrieve the text
        .then((text) => parseFloat(text.replace(/,/g, '')).toFixed(2)) // Remove commas and parse as float
        .should('eq', unitPrice.toFixed(2));
      cy.get('td[name="tax_id"]').eq(index).invoke('text').should('be.oneOf', [tax, '']);
    });
  });
};

const clickSaveButton = () => {
  cy.wait(1000);
  cy.get('button').contains('Confirm').click();
  cy.wait(8000);
};

const assertMessage = (text: string) => {
  cy.get('.o_Message_prettyBody')
    .invoke('text')
    .then((messageText) => {
      const cleanedText = helpersCommnds.clearText(messageText);
      expect(cleanedText).to.contain(text);
    });
};

// Dissmiss hours warning for mistmatching roles, scenario required for one of tests
const dismissHoursWarning = () => {
  cy.intercept('POST', '/mail/thread/data').as('postRequest');
  cy.get('button').then(($buttons) => {
    cy.wait('@postRequest');
    $buttons.each((index, button) => {
      if (Cypress.$(button).text().trim() === 'Ok') {
        cy.getButtonByPartialText('Ok').click();
      }
    });
  });
};

const assertCurrentState = (expectedState: string) => {
  const states = ['Quotation', 'Quotation Sent', 'Sales Order'];
  const notActiveStates = states.filter((state) => state !== expectedState);

  cy.get('[aria-label="Current state"]').should('have.text', expectedState);
  notActiveStates.forEach((state) => {
    cy.get('[aria-label="Current state"]').should('not.have.text', state);
  });
};

const addProducts = (products: Product[]) => {
  cy.intercept('/web/dataset/call_kw/sale.order/onchange').as('onchange');

  products.forEach((product: Product, index: number) => {
    const { name, productUomQty, productUom, unitPrice, tax } = product;

    cy.contains('Add a product').click();
    cy.get('td [name="product_template_id"]').eq(index).click();
    cy.get('[name="product_template_id"] input').type(name);
    cy.contains(`Create "${name}"`).click();

    cy.wait('@onchange');
    helpersCommnds.clickOutside();

    cy.get('[data-id] td [name="product_template_id"]').eq(index).should('have.text', name);
    cy.get('[data-id] td [name="name"]') //
      .eq(index)
      .should('have.text', name);
    cy.get('[name="product_uom_qty"]') //
      .eq(index)
      .should('have.text', productUomQty.toFixed(2));
    cy.get('[name="product_uom"]') //
      .eq(index)
      .should('have.text', productUom);
    cy.get('[name="price_unit"]') //
      .eq(index)
      .should('have.text', unitPrice.toFixed(2));
    cy.get('[name="tax_id"]') //
      .eq(index)
      .should('have.text', tax);
  });
};

const assertHourListTab = (monthlyHours: string) => {
  let quotationFixture: string;
  const HOURS_SEPTEMBER = '168';
  const HOURS_OCTOBER = '176';
  const HOURS_FEBURARY = '160';

  if (monthlyHours === HOURS_OCTOBER) {
    quotationFixture = 'test-data/Quotation4Soft';
  } else if (monthlyHours === HOURS_SEPTEMBER) {
    quotationFixture = 'test-data/Quotation4Soft_2';
  } else if (monthlyHours === HOURS_FEBURARY) {
    quotationFixture = 'test-data/QuotationOrange';
  } else {
    throw new Error(`Test data unavailable for maximum monthly hours: ${monthlyHours}`);
  }

  cy.fixture(quotationFixture).then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { availabilityData }: { availabilityData: Array<unknown> } = data;

    availabilityData.forEach((userAvailability: UserAvailability) => {
      const { name, expectedAvailability, netPrice } = userAvailability;
      const netPriceNumber = parseFloat(netPrice);
      cy.get("td[name='user_name']")
        .contains(name)
        .siblings("td[name='availability']")
        .within(() => {
          cy.get('.o_progressbar_value').should('have.text', `${expectedAvailability}%`);
        });
      cy.get("td[name='user_name']")
        .contains(name)
        .siblings("td[name='net_price']")
        .invoke('text')
        .then((text) => {
          const formattedNetPrice = extractNumbers(text);
          cy.wrap(formattedNetPrice).should('eq', netPriceNumber.toFixed(2));
        });
    });
  });
};

const assertRoleData = (monthlyHours: string) => {
  let quotationFixture: string;

  if (monthlyHours === '176') {
    quotationFixture = 'test-data/Quotation4Soft';
  } else if (monthlyHours === '168') {
    quotationFixture = 'test-data/Quotation4Soft_2';
  } else if (monthlyHours === '160') {
    quotationFixture = 'test-data/QuotationOrange';
  } else {
    throw new Error(`Test data unavailable for maximum monthly hours: ${monthlyHours}`);
  }
  cy.fixture(quotationFixture).then((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { roleData }: { roleData: Array<unknown> } = data;
    roleData.forEach((role: RoleData) => {
      const { role: roleName, quantity, subTotal } = role;

      cy.contains("td[name='name']", roleName)
        .siblings("td[name='product_uom_qty']")
        .invoke('text')
        .should('eq', quantity);

      cy.contains("td[name='name']", roleName)
        .siblings("td[name='price_subtotal']")
        .invoke('text')
        .then((text) => {
          const formattedSubtotal = parseFloat(extractNumbers(text));
          const expectedSubtotal = parseFloat(subTotal);
          cy.wrap(formattedSubtotal).should('eq', expectedSubtotal);
        });
    });
  });
};

const extractNumbers = (text: string) => text.replace(/[^\d.-]+/g, '');

const getRoleAndCheckOvertime = (row: JQuery<HTMLElement>) => {
  const role = row.find("td[name='name']").text();
  const isOvertimeRow = role.toLowerCase().includes('overtime');
  return { role, isOvertimeRow };
};