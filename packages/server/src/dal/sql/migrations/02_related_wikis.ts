import {DataTypes, QueryInterface} from "sequelize";

async function up({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.createTable('WikiPageToWikiPage', {
            WikiPageId: {
                type: DataTypes.UUID,
            },
            relatedWikiId: {
                type: DataTypes.UUID,
            },
            createdAt: {
                type: DataTypes.TIME
            },
            updatedAt: {
                type: DataTypes.TIME
            }
        });
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.dropTable('WikiPageToWikiPage');
}

export {up, down};