import "@testing-library/cypress/add-commands";
import "../support/commands.ts";

describe("Standings page", () => {
    beforeEach(() => {
        cy.intercept("POST", "**/login", {
            statusCode: 200,
            body: {
                token: "fake-token",
                user: {
                    id: 1,
                    name: "Matt",
                    selected_team: "DET",
                },
            },
        }).as("login");

        cy.visit("/");

        "12345678".split("").forEach((digit, index) => {
            cy.get(`[aria-label="Access code digit ${index + 1}"]`).type(digit);
        });

        cy.wait("@login");
        cy.getByTestId("Standings").click();

        cy.url({ timeout: 3000 }).should("include", "/standings");
    });

    it("renders the standings tables", () => {
        cy.getByTestId("standings").should("be.visible");
        cy.getByTestId("standings-table").should("have.length", 6);
    });
});
