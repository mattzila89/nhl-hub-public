import "@testing-library/cypress/add-commands";
import "../support/commands.ts";

describe("Playoffs page", () => {
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
        cy.getByTestId("Playoffs").click();

        cy.url({ timeout: 3000 }).should("include", "/playoffs");
    });

    it("renders the playoff bracket", () => {
        cy.getByTestId("playoffs").should("be.visible");
        cy.getByTestId("bracket-logo").should("be.visible");
        cy.getByTestId("bracket-slot").should("have.length", 15);

        cy.getByTestId("bracket-slot")
            .first()
            .within(() => {
                cy.getByTestId("team-logo").should("exist").and("be.visible");
                cy.getByTestId("team-abbrev").should("exist").and("be.visible");
                cy.getByTestId("team-seed").should("exist").and("be.visible");
                cy.getByTestId("team-wins").should("exist").and("be.visible");
            });
    });
});
