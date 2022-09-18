import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {
    DomainEntity,
    PermissionControlledEntity, UnitOfWork,
} from "../../../types";
import {MongoClient} from 'mongodb';
import MongodbDbEngine from "../mongodb-db-engine";
import EntityMapper from "../../../domain-entities/entity-mapper";
import {FILTER_CONDITION_OPERATOR_IN, FilterCondition} from "../../filter-condition";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";
import {Repository} from "../../repository/repository";
import {ServerConfigRepository} from "../../repository/server-config-repository";

@injectable()
export default class MongoDbMigrationV40 {
    @inject(INJECTABLE_TYPES.ServerConfigRepository)
    serverConfigRepository: ServerConfigRepository;

    @inject(INJECTABLE_TYPES.EntityMapper)
    entityMapper: EntityMapper;

    async migrate(dbEngine: MongodbDbEngine, unitOfWork: UnitOfWork) {
        let serverConfig = await this.serverConfigRepository.findOne();
        if (serverConfig && serverConfig.version < '4.0') {
            console.log('Migrating mongodb schema to version 4.0');
            const client = new MongoClient(dbEngine.getConnectionString());
            try {
                await client.connect();
                const permissionAssignments = await client.db(dbEngine.mongodb_db_name).collection('permissionassignments').find({}).toArray();
                for (let permissionAssignment of permissionAssignments) {
                    const repo: Repository<DomainEntity> = this.entityMapper.map(permissionAssignment.subjectType).getRepository(unitOfWork);
                    const entity: PermissionControlledEntity = await repo.findOneById(permissionAssignment.subject.toString()) as PermissionControlledEntity;
                    const usersWithPermission = await client.db(dbEngine.mongodb_db_name).collection('users').find({permissions: permissionAssignment._id}).toArray();
                    for (let user of usersWithPermission) {
                        entity.acl.push({
                            permission: permissionAssignment.permission,
                            principal: user._id.toString(),
                            principalType: USER
                        });
                    }
                    const rolesWithPermission = await client.db(dbEngine.mongodb_db_name).collection('roles').find({permissions: permissionAssignment._id}).toArray();
                    for (let role of rolesWithPermission) {
                        entity.acl.push({
                            permission: permissionAssignment.permission,
                            principal: role._id.toString(),
                            principalType: ROLE
                        });
                    }
                    await repo.update(entity);
                }
            } finally {
                await client.close();
            }
            // refresh config after permissions have changed above
            serverConfig = await this.serverConfigRepository.findOne();
            serverConfig.version = '4.0';
            await unitOfWork.serverConfigRepository.update(serverConfig);
        }
    }
}