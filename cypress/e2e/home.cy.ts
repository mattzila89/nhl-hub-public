import "@testing-library/cypress/add-commands";
import "../support/commands.ts";

describe("Home page", () => {
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

        cy.url({ timeout: 3000 }).should("include", "/home");
    });

    it("renders the app layout and all the sections", () => {
        cy.getByTestId("app-layout")
            .should("be.visible")
            .within(() => {
                // Navigation
                cy.getByTestId("nav-bar").should("be.visible");

                // Main
                cy.getByTestId("main")
                    .should("be.visible")
                    .within(() => {
                        // Games Grid
                        cy.getByTestId("games-grid")
                            .should("be.visible")
                            .within(() => {
                                cy.getByTestId("game-card").should(
                                    "have.length",
                                    2,
                                );
                            });

                        cy.getByTestId("chat-panel").should("be.visible");
                    });
            });
    });
});
