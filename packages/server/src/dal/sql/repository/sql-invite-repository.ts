import { inject, injectable } from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import { Invite } from "../../../domain-entities/invite.js";
import InviteModel from "../models/invite-model.js";
import { InviteRepository } from "../../repository/invite-repository.js";
import { INJECTABLE_TYPES } from "../../../di/injectable-types.js";
import InviteFactory from "../../../domain-entities/factory/invite-factory.js";

@injectable()
export default class SqlInviteRepository extends AbstractSqlRepository<Invite, InviteModel> implements InviteRepository {
	
	@inject(INJECTABLE_TYPES.InviteFactory)
	entityFactory: InviteFactory;

	staticModel = InviteModel;

	async modelFactory(entity: Invite | undefined): Promise<InviteModel> {
		return InviteModel.build({
			_id: entity?._id,
			email: entity?.email,
			createdByUserId: entity?.createdByUserId,
		});
	}

	async findByEmail(email: string): Promise<Invite[]> {
		return this.buildResults(
			await InviteModel.findAll({
				where: {
					email,
				},
			})
		);
	}

	async deleteByEmail(normalizedEmail: string): Promise<void> {
		return InviteModel.destroy({
			where: {
				email: normalizedEmail,
			},
		}).then(() => {});
	}
}
