import {DataTypes, QueryInterface} from "sequelize";

async function up({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.changeColumn('Message', 'message', {type: DataTypes.STRING(512)});
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.changeColumn('Message', 'message', {type: DataTypes.STRING(255)});
}

export {up, down};