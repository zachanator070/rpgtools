import 'cypress-xpath';
import 'cypress-file-upload';

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
});