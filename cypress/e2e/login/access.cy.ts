import "@testing-library/cypress/add-commands";
import "../../support/commands.ts";

describe("Access page", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("renders the access screen", () => {
        cy.contains("Enter your access code").should("be.visible");
        cy.contains("Private space. Just for the boys.").should("be.visible");

        cy.get('[aria-label="Access code digit 1"]').should("be.visible");
    });

    it("logs in and redirects to home when user already has a selected team", () => {
        cy.intercept("POST", "**/login", {
            statusCode: 200,
            body: {
                token: "fake-token",
                user: {
                    id: 1,
                    name: "Matt",
                    access_code: "12345678",
                    selected_team: "DET",
                    last_login_at: new Date().toISOString(),
                },
            },
        }).as("login");

        "12345678".split("").forEach((digit, index) => {
            cy.get(`[aria-label="Access code digit ${index + 1}"]`).type(digit);
        });

        cy.wait("@login").its("request.body").should("deep.equal", {
            access_code: "12345678",
        });

        cy.url({ timeout: 3000 }).should("include", "/home");
    });

    it("logs in and redirects to select team when user has no selected team", () => {
        cy.intercept("POST", "**/login", {
            statusCode: 200,
            body: {
                token: "fake-token",
                user: {
                    id: 1,
                    name: "Matt",
                    access_code: "12345678",
                    selected_team: null,
                    last_login_at: new Date().toISOString(),
                },
            },
        }).as("login");

        "12345678".split("").forEach((digit, index) => {
            cy.get(`[aria-label="Access code digit ${index + 1}"]`).type(digit);
        });

        cy.wait("@login");

        cy.url({ timeout: 3000 }).should("include", "/select-team");
    });

    it("shows an error message when the access code is invalid", () => {
        cy.intercept("POST", "**/login", {
            statusCode: 401,
            body: {
                error: "Invalid access code. 2 tries left.",
                code: "INVALID_ACCESS_CODE",
                triesRemaining: 2,
            },
        }).as("login");

        "00000000".split("").forEach((digit, index) => {
            cy.get(`[aria-label="Access code digit ${index + 1}"]`).type(digit);
        });

        cy.wait("@login");

        cy.contains("Invalid access code. 2 tries left.").should("be.visible");

        cy.get('[aria-label="Access code digit 1"]').should("have.value", "");
    });

    it("redirects to select-team when selected_team is undefined", () => {
        cy.intercept("POST", "**/login", {
            statusCode: 200,
            body: {
                token: "fake-token",
                user: {
                    id: 1,
                    name: "Matt",
                    access_code: "12345678",
                    selected_team: undefined,
                    last_login_at: new Date().toISOString(),
                },
            },
        }).as("login");

        "12345678".split("").forEach((digit, index) => {
            cy.get(`[aria-label="Access code digit ${index + 1}"]`).type(digit);
        });

        cy.wait("@login");

        cy.url({ timeout: 3000 }).should("include", "/select-team");
    });

    it("allows a user to select a team and continue to home", () => {
        cy.intercept("POST", "**/login", {
            statusCode: 200,
            body: {
                token: "fake-token",
                user: {
                    id: 1,
                    name: "Matt",
                    access_code: "12345678",
                    selected_team: null,
                    last_login_at: new Date().toISOString(),
                },
            },
        }).as("login");

        cy.intercept("POST", "**/select-team", {
            statusCode: 200,
            body: {
                success: true,
            },
        }).as("selectTeam");

        "12345678".split("").forEach((digit, index) => {
            cy.get(`[aria-label="Access code digit ${index + 1}"]`).type(digit);
        });

        cy.wait("@login");

        cy.url({ timeout: 3000 }).should("include", "/select-team");

        cy.getByTestId("team-tile-DET").click();
        cy.getByTestId("select-team-continue").click();

        cy.url({ timeout: 3000 }).should("include", "/home");
        cy.getByTestId("Detroit Red Wings").should("exist");
    });
});
