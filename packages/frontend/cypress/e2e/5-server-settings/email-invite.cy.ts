import {adminLogin, goToServerSettings, seedMiddleEarth, stopApp} from "../../util/helper";

describe("invite user", () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToServerSettings();
    });

    after(() => {
        stopApp();
    });

    it("shows invite UI and adds an invite", () => {
        const inviteEmail = "invite-user@example.com";

        cy.contains("h2", "Invites");
        cy.get("#inviteEmail").should("be.visible");
        cy.get("button").contains("Invite").should("be.visible");

        cy.get("#inviteEmail").type(inviteEmail);
        cy.get("button").contains("Invite").click();

        cy.get("#inviteEmail").should("have.value", "");
        cy.get("#inviteList").should("contain.text", inviteEmail);
    });
})