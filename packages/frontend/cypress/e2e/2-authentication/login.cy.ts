import {goHome, logout, seedMiddleEarth} from "../../util/helper";
import {TEST_USER_PASSWORD, TEST_USER_USERNAME} from "../../util/constants";

describe("login", () => {

    beforeEach(() => {
        seedMiddleEarth();
        logout();
        goHome();
        cy.get("a").contains("Login").click();
    });

    it("success", () => {
        cy.get("#loginEmail").type(TEST_USER_USERNAME);
        cy.get('#loginPassword').type(TEST_USER_PASSWORD);
        cy.get('#submit').click();
        cy.get('#userGreeting').contains(`Hello ${TEST_USER_USERNAME}`);
    });

    it("bad password", () => {
        cy.get("#loginEmail").type(TEST_USER_USERNAME);
        cy.get('#loginPassword').type("bad_password");
        cy.get('#submit').click();
    });
});