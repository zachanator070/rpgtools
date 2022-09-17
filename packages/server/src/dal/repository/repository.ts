import {DomainEntity} from "../../types";

export interface Repository<Type extends DomainEntity> {
    create: (entity: Type) => Promise<void>;
    update: (entity: Type) => Promise<void>;
    delete: (entity: Type) => Promise<void>;
    findById: (id: string) => Promise<Type>;
    findAll: () => Promise<Type[]>;
}