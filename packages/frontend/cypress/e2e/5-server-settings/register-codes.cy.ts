import {adminLogin, goToServerSettings, seedMiddleEarth} from "../../util/helper";

describe("register codes", () => {

    beforeEach(() => {
        seedMiddleEarth();
        adminLogin();
        goToServerSettings();
    });

    it("generate 1", () => {
        cy.get("#numberCodesToGenerate").type("1");
        cy.get("button").contains("Generate").click();
        cy.get("li").contains("register_me").next().should("not.be.empty");
    });

    it("generate 3", () => {
        cy.get("#numberCodesToGenerate").type("3");
        cy.get("button").contains("Generate").click();
        cy.get("li").contains("register_me").next().should("not.be.empty");
        cy.get("li").contains("register_me").next().next().should("not.be.empty");
        cy.get("li").contains("register_me").next().next().next().should("not.be.empty");
    });
})