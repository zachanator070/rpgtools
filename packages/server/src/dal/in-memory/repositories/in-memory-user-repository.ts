import { User } from "../../../domain-entities/user";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryUserRepository extends AbstractInMemoryRepository<User> {}
