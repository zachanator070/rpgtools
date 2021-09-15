import { User } from "../../src/domain-entities/user";
import { SecurityContext } from "../../src/security-context";
import { World } from "../../src/domain-entities/world";
import { Role } from "../../src/domain-entities/role";
import { WikiFolder } from "../../src/domain-entities/wiki-folder";
import { MockSessionContextFactory } from "./MockSessionContextFactory";
import { ApiServer } from "../../src/types";
import { WikiPage } from "../../src/domain-entities/wiki-page";
import { Pin } from "../../src/domain-entities/pin";

export interface TestingContext {
	mockSessionContextFactory: MockSessionContextFactory;
	server: ApiServer;
	otherUser: User;
	otherUserSecurityContext: SecurityContext;
	world: World;
	testRole: Role;
	currentUser: User;
	testerSecurityContext: SecurityContext;
	newFolder: WikiFolder;
	otherPage: WikiPage;
	pin: Pin;
	reset: () => Promise<TestingContext>;
}