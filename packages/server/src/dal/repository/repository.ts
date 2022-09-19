import {DomainEntity} from "../../types";
import {DatabaseSession} from "../database-session";

export interface Repository<Type extends DomainEntity> {
    create: (entity: Type) => Promise<void>;
    update: (entity: Type) => Promise<void>;
    delete: (entity: Type) => Promise<void>;
    findOneById: (id: string) => Promise<Type>;
    findByIds: (id: string[]) => Promise<Type[]>;
    findAll: () => Promise<Type[]>;

    setDatabaseSession(session: DatabaseSession): void;
}