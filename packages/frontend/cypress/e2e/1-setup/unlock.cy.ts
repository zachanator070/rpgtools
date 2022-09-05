import {goHome, seedNewServer} from "../../util/helper";
import {UNLOCK_CODE} from "../../util/constants";

describe("Unlock server test", () => {

    const badUnlockCode: string = "asdf";
    const email: string = "email@gmail.com";
    const username: string = "admin";
    const password: string = "asdf";

    beforeEach(() => {
        seedNewServer();
        goHome();
    });

    it("failure", () => {
        cy.get("#adminSecret").type(`${badUnlockCode}`);
        cy.get("#registerEmail").type(`${email}`);
        cy.get("#registerDisplayName").type(`${username}`);
        cy.get("#registerPassword").type(`${password}`);
        cy.get("#registerRepeatPassword").type(`${password}`);
        cy.get("#submit").click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/ui/setup")
        });
        cy.get('#errors');
    });

    it("success", () => {
        cy.get("#adminSecret").type(`${UNLOCK_CODE}`);
        cy.get("#registerEmail").type(`${email}`);
        cy.get("#registerDisplayName").type(`${username}`);
        cy.get("#registerPassword").type(`${password}`);
        cy.get("#registerRepeatPassword").type(`${password}`);
        cy.get("#submit").click();
        cy.location().should((location) => {
            expect(location.href).eq("http://localhost:3000/")
        })
    });
});