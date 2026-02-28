import {goHome, seedNewServer, stopApp} from "../../util/helper";
import {ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME} from "../../util/constants";

describe("Unlock server test", () => {

    beforeEach(() => {
        seedNewServer();
        goHome();
    });

    after(() => {
        stopApp();
    });

    it("failure", () => {
        cy.get("#registerEmail").type(`${ADMIN_EMAIL}`);
        cy.get("#registerDisplayName").type(`${ADMIN_USERNAME}`);
        cy.get("#registerPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#registerRepeatPassword").type("wrong-password");
        cy.get("#submit").click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/ui/setup")
        });
        cy.get('#errors');
    });

    it("success", () => {
        cy.get("#registerEmail").type(`${ADMIN_EMAIL}`);
        cy.get("#registerDisplayName").type(`${ADMIN_USERNAME}`);
        cy.get("#registerPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#registerRepeatPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#submit").click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/ui")
        })
    });
});
