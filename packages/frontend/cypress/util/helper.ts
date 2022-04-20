import {ADMIN_PASSWORD, ADMIN_USERNAME, MIDDLE_EARTH_MAP, MIDDLE_EARTH_WIKI, MIDDLE_EARTH_WIKI_EDIT} from "./constants";

export function seedNewServer() {
    cy.exec("npm run seed:new");
}

export function seedMiddleEarth() {
    cy.exec("npm run seed:middle_earth");
}

export function goHome() {
    cy.visit("http://localhost:3000/");
}

export function logout() {
    cy.request('POST', 'http://localhost:3000/api', {
        "operationName": "logout",
        "variables": {},
        "query": "mutation logout {logout}"
    });
}

export function adminLogin() {
    cy.request('POST', 'http://localhost:3000/api', {
        "operationName": "login",
        "variables": {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
        "query": "mutation login($username: String!, $password: String!) {\n  login(username: $username, password: $password) {\n    _id\n    __typename\n  }\n}\n"
    });
}

export function goToMap() {
    cy.visit(MIDDLE_EARTH_MAP);
}

export function goToWiki() {
    cy.visit(MIDDLE_EARTH_WIKI);
}

export function goToEditWiki() {
    cy.visit(MIDDLE_EARTH_WIKI_EDIT);
}