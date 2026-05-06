declare global {
    namespace Cypress {
        interface Chainable {
            getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
        }
    }
}

Cypress.Commands.add("getByTestId", (testId) => {
    return cy.get(`[data-testid="${testId}"]`);
});

export {};
