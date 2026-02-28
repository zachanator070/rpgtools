import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import { InviteRepository } from "../../repository/invite-repository.js";
import { Invite } from "../../../domain-entities/invite.js";
import { FilterCondition } from "../../filter-condition.js";

@injectable()
export class InMemoryInviteRepository extends AbstractInMemoryRepository<Invite> implements InviteRepository {
	findByEmail(email: string): Promise<Invite[]> {
		return this.find([new FilterCondition("email", email)]);
	}
	async deleteByEmail(normalizedEmail: string): Promise<void> {
		const invite = await this.findOne([new FilterCondition("email", normalizedEmail)]);
		if (invite) {
			this.delete(invite);
		}
	}
}
