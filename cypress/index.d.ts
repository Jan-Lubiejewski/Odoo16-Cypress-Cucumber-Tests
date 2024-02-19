// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getInputByLabel(label: string): Chainable<JQuery<HTMLElement>>;
      getInputById(label: string): Chainable<JQuery<HTMLElement>>;
      getByClass(id: string): Chainable<JQuery<HTMLElement>>;
      getButtonByPartialText(buttonText: string): Chainable<JQuery<HTMLElement>>;
      getButtonByTitle(btnTitle: string): Chainable<JQuery<HTMLElement>>;
      getLinkByText(linkText: string): Chainable<JQuery<HTMLElement>>;
      getByName(name: string) : Chainable<JQuery<HTMLElement>>;
      getByTooltip(role: string) : Chainable<JQuery<HTMLElement>>;
    }
}