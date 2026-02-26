import { DataTypes, ModelAttributes, QueryInterface } from "sequelize";

const defaultAttributes: ModelAttributes = {
	_id: {
		type: DataTypes.UUID,
		primaryKey: true,
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false,
	},
};

async function up({ context: queryInterface }: { context: QueryInterface }) {
	await queryInterface.createTable("Invite", {
		...defaultAttributes,
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		createdByUserId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "User",
				key: "_id",
			},
		},
	});

	await queryInterface.bulkDelete("RegisterCode", {});
	await queryInterface.dropTable("RegisterCode");

	await queryInterface.changeColumn("User", "password", {
		type: DataTypes.STRING,
		allowNull: true,
	});
}

async function down({ context: queryInterface }: { context: QueryInterface }) {
	await queryInterface.createTable("RegisterCode", {
		...defaultAttributes,
		code: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		ServerConfigId: {
			type: DataTypes.UUID,
			references: {
				model: "ServerConfig",
				key: "_id",
			},
		},
	});

	await queryInterface.dropTable("Invite");
	await queryInterface.changeColumn("User", "password", {
		type: DataTypes.STRING,
		allowNull: false,
	});
}

export { up, down };
