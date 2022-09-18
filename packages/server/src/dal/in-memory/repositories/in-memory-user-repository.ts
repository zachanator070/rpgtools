import { User } from "../../../domain-entities/user";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {UserRepository} from "../../repository/user-repository";
import {PaginatedResult} from "../../paginated-result";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryUserRepository extends AbstractInMemoryRepository<User> implements UserRepository {

    findByUsernamePaginated(username: string, page: number): Promise<PaginatedResult<User>> {
        return this.findPaginated([
            new FilterCondition("username", `^${username}*`, FILTER_CONDITION_REGEX),
        ], page || 1)
    }

    findWithRole(roleId: string): Promise<User[]> {
        return this.find([new FilterCondition('role', roleId)]);
    }

    findOneByUsername(username: string): Promise<User> {
        return this.findOne([
            new FilterCondition("username", username),
        ]);
    }

    findByUsername(username: string): Promise<User[]> {
        return this.find([
            new FilterCondition("username", username),
        ]);
    }

    findByEmail(email: string): Promise<User[]> {
        return this.find([new FilterCondition("email", email)]);
    }
}
