import {QueryInterface} from "sequelize";
import WikiPageToWikiPageModel from "../models/wiki-page-to-wiki-page-model.js";


async function up({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.createTable('WikiPageToWikiPage', WikiPageToWikiPageModel.attributes);
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.dropTable('WikiPageToWikiPage');
}

export {up, down};