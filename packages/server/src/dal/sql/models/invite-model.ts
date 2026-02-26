import SqlModel from "./sql-model.js";
import { defaultAttributes } from "./default-attributes.js";
import { DataTypes } from "sequelize";
import { USER } from "@rpgtools/common/src/type-constants.js";

export default class InviteModel extends SqlModel {
	declare email: string;
	declare createdByUserId: string | null;

	static attributes = {
		...defaultAttributes,
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		createdByUserId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: USER,
				key: "_id",
			},
		},
	};

	static connect() {}
}
