import { Repository } from "./repository.js";
import { Invite } from "../../domain-entities/invite.js";

export interface InviteRepository extends Repository<Invite> {
	deleteByEmail(normalizedEmail: string): Promise<void>;
	findByEmail(email: string): Promise<Invite[]>;
}
