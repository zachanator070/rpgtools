import { injectable } from "inversify";
import { EntityFactory } from "../../types.js";
import { Invite } from "../invite.js";
import InviteModel from "../../dal/sql/models/invite-model.js";
import { InviteAuthorizationPolicy } from "../../security/policy/invite-authorization-policy.js";

@injectable()
export default class InviteFactory implements EntityFactory<Invite, InviteModel> {
	build({
		_id,
		email,
		createdByUserId,
	}: {
		_id?: string;
		email: string;
		createdByUserId?: string | null;
	}) {
		const invite: Invite = new Invite(new InviteAuthorizationPolicy(), this);
		invite._id = _id;
		invite.email = email;
		invite.createdByUserId = createdByUserId ?? null;
		return invite;
	}

	async fromSqlModel(model: InviteModel): Promise<Invite> {
		return this.build({
			_id: model._id,
			email: model.email,
			createdByUserId: model.createdByUserId,
		});
	}
}
