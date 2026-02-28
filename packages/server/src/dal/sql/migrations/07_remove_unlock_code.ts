import { DataTypes, QueryInterface } from "sequelize";

async function up({ context: queryInterface }: { context: QueryInterface }) {
	await queryInterface.removeColumn("ServerConfig", "unlockCode");
}

async function down({ context: queryInterface }: { context: QueryInterface }) {
	await queryInterface.addColumn("ServerConfig", "unlockCode", {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: "",
	});
}

export { up, down };
