import {DataTypes, ModelAttributes, QueryInterface} from "sequelize";

async function up({ context: queryInterface }: {context: QueryInterface}) {
    // Migration for adding token fields to GameModel
    // These are actually added in migration 05, so this is a no-op
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    // No-op rollback
}

export {up, down};
