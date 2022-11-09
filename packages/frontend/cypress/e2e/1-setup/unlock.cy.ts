import {goHome, seedNewServer} from "../../util/helper";
import {ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, UNLOCK_CODE} from "../../util/constants";

describe("Unlock server test", () => {

    const badUnlockCode: string = "asdf";

    beforeEach(() => {
        seedNewServer();
        goHome();
    });

    it("failure", () => {
        cy.get("#adminSecret").type(`${badUnlockCode}`);
        cy.get("#registerEmail").type(`${ADMIN_EMAIL}`);
        cy.get("#registerDisplayName").type(`${ADMIN_USERNAME}`);
        cy.get("#registerPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#registerRepeatPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#submit").click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/ui/setup")
        });
        cy.get('#errors');
    });

    it("success", () => {
        cy.get("#adminSecret").type(`${UNLOCK_CODE}`);
        cy.get("#registerEmail").type(`${ADMIN_EMAIL}`);
        cy.get("#registerDisplayName").type(`${ADMIN_USERNAME}`);
        cy.get("#registerPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#registerRepeatPassword").type(`${ADMIN_PASSWORD}`);
        cy.get("#submit").click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/")
        })
    });
});