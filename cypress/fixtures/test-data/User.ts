export const admin = {
    email: Cypress.env('email') as string,
    password: Cypress.env('password') as string,
};