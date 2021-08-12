import { User } from "../../src/domain-entities/user";
import { SecurityContext } from "../../src/security-context";
import { World } from "../../src/domain-entities/world";
import { Role } from "../../src/domain-entities/role";
import { WikiFolder } from "../../src/domain-entities/wiki-folder";
import { ApolloServerTestClient } from "apollo-server-testing";
import { MockSessionContextFactory } from "./MockSessionContextFactory";
import { ApiServer } from "../../src/types";

export interface TestingContext extends ApolloServerTestClient {
	mockSessionContextFactory: MockSessionContextFactory;
	server: ApiServer;
	otherUser: User;
	otherUserSecurityContext: SecurityContext;
	world: World;
	testRole: Role;
	currentUser: User;
	testerSecurityContext: SecurityContext;
	newFolder: WikiFolder;
	reset: () => Promise<TestingContext>;
}
