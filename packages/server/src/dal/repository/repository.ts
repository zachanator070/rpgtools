import {DomainEntity} from "../../types";

export interface Repository<Type extends DomainEntity> {
    create: (entity: Type, preserveId?: boolean) => Promise<void>;
    update: (entity: Type) => Promise<void>;
    delete: (entity: Type) => Promise<void>;
    findOneById: (id: string) => Promise<Type>;
    findByIds: (id: string[]) => Promise<Type[]>;
    findAll: () => Promise<Type[]>;
    withConstraintsDisabled: <T>(callback: () => Promise<T>) => Promise<T>;
}
