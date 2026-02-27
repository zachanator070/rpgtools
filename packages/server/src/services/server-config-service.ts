import { SERVER_ADMIN_ROLE, SERVER_PERMISSIONS } from "@rpgtools/common/src/permission-constants.js";
import {ROLE} from "@rpgtools/common/src/type-constants.js";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {
	ApiServer,
} from "../types.js";
import { SecurityContext } from "../security/security-context.js";
import {AuthenticationService} from "./authentication-service.js";
import {DatabaseContext} from "../dal/database-context.js";
import RoleFactory from "../domain-entities/factory/role-factory.js";
import InviteFactory from "../domain-entities/factory/invite-factory.js";
import { Invite } from "../domain-entities/invite.js";
import {ServerProperties} from "../server/server-properties.js";
import { InviteEmailService } from "./invite-email-service.js";
import { EmailService } from "./email-service.js";

@injectable()
export class ServerConfigService {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.ApiServer)
	server: ApiServer;

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	@inject(INJECTABLE_TYPES.InviteFactory)
	inviteFactory: InviteFactory;

	@inject(INJECTABLE_TYPES.ServerProperties)
	serverProperties: ServerProperties;

	@inject(INJECTABLE_TYPES.InviteEmailService)
	inviteEmailService: InviteEmailService;

	@inject(INJECTABLE_TYPES.EmailService)
	emailService: EmailService;

	serverNeedsSetup = async (databaseContext: DatabaseContext): Promise<boolean> => {
		let adminRole = await databaseContext.roleRepository.findOneByName(SERVER_ADMIN_ROLE);

		if (!adminRole) {
			return true;
		}

		const serverConfig = await databaseContext.serverConfigRepository.findOne();
		if (!serverConfig) {
			throw new Error("No server config exists! Did the seeders run correctly?");
		}

		return serverConfig.adminUsers.length === 0;
	};

	unlockServer = async (unlockCode: string, email: string, username: string, password: string, databaseContext: DatabaseContext) => {
		const server = await databaseContext.serverConfigRepository.findOne();
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!await this.serverNeedsSetup(databaseContext)) {
			throw new Error("Server already unlocked!");
		}
		if (server.unlockCode !== unlockCode) {
			throw new Error("Unlock code is incorrect");
		}
		if (server.adminUsers.length > 0) {
			throw new Error("Server is already unlocked");
		}
		const admin = await this.authenticationService.registerUser(
			email,
			username,
			password,
			databaseContext
		);
		const adminRole = this.roleFactory.build({name: SERVER_ADMIN_ROLE, world: null, acl: []});
		await databaseContext.roleRepository.create(adminRole);
		for (let permission of SERVER_PERMISSIONS) {

			server.acl.push({
				permission,
				principal: adminRole._id,
				principalType: ROLE
			});
		}
		admin.roles.push(adminRole._id);
		await databaseContext.userRepository.update(admin);
		server.adminUsers.push(admin._id);
		await databaseContext.serverConfigRepository.update(server);
		return true;
	};

	inviteUser = async (context: SecurityContext, email: string, databaseContext: DatabaseContext): Promise<Invite> => {
		const serverConfig = await databaseContext.serverConfigRepository.findOne();
		if (!serverConfig) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await serverConfig.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to call this method");
		}

		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			throw new Error("Email is required");
		}

		if ((await databaseContext.userRepository.findByEmail(normalizedEmail)).length > 0) {
			throw new Error("A user with this email already exists");
		}

		if ((await databaseContext.inviteRepository.findByEmail(normalizedEmail)).length > 0) {
			throw new Error("An invite already exists for this email");
		}

		const invite = this.inviteFactory.build({
			email: normalizedEmail,
			createdByUserId: context.user?._id || null,
		});
		await databaseContext.inviteRepository.create(invite);
		await this.inviteEmailService.sendInviteEmail(normalizedEmail, context.user?.username);
		return invite;
	};

	sendEmailInvite = async (context: SecurityContext, email: string, databaseContext: DatabaseContext): Promise<Invite> => {
		const serverConfig = await databaseContext.serverConfigRepository.findOne();
		if (!serverConfig) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await serverConfig.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to call this method");
		}

		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			throw new Error("Email is required");
		}

		const invites = await databaseContext.inviteRepository.findByEmail(normalizedEmail);
		if (invites.length === 0) {
			throw new Error("No invite exists for this email");
		}

		await this.inviteEmailService.sendInviteEmail(normalizedEmail, context.user?.username);
		return invites[0];
	};

	getServerConfig = async (databaseContext: DatabaseContext) => {
		return databaseContext.serverConfigRepository.findOne();
	};

	isSsoConfigured = (): boolean => {
		return this.serverProperties.isSsoConfigured();
	};

	isEmailConfigured = (): boolean => {
		return this.emailService.isConfigured();
	};

	setDefaultWorld = async (context: SecurityContext, worldId: string, databaseContext: DatabaseContext) => {
		const serverConfig = await databaseContext.serverConfigRepository.findOne();
		if (!serverConfig) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await serverConfig.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to call this method");
		}

		const world = await databaseContext.worldRepository.findOneById(worldId);
		if(!world) {
			throw new Error("World could not be found.")
		}

		serverConfig.defaultWorld = worldId;
		await databaseContext.serverConfigRepository.update(serverConfig);
		return serverConfig;
	};
}
