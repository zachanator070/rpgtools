import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {User} from "../../../domain-entities/user";
import UserModel from "../models/user-model";
import {UserRepository} from "../../repository/user-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import UserFactory from "../../../domain-entities/factory/user-factory";
import {PaginatedResult} from "../../paginated-result";
import {RoleModel} from "../models/role-model";
import sequelize, {Op} from "sequelize";


@injectable()
export default class SqlUserRepository extends AbstractSqlRepository<User, UserModel> implements UserRepository {

    @inject(INJECTABLE_TYPES.UserFactory)
    entityFactory: UserFactory;

    staticModel = UserModel;

    async modelFactory(entity: User | undefined): Promise<UserModel> {
        return UserModel.build({
            _id: entity._id,
            email: entity.email,
            username: entity.username,
            password: entity.password,
            tokenVersion: entity.tokenVersion,
            currentWorldId: entity.currentWorld
        });
    }

    async updateAssociations(entity: User, model: UserModel) {
        const roleModels = await RoleModel.findAll({where: {_id: entity.roles}});
        await model.setRoles(roleModels);
    }

    async findByEmail(email: string): Promise<User[]> {
        return this.buildResults(await UserModel.findAll({
            where: {
                email
            }
        }));
    }

    async findByUsername(username: string): Promise<User[]> {
        return this.buildResults(await UserModel.findAll({
            where: {
                username
            }
        }));
    }

    async findByUsernamePaginated(username: string, page: number): Promise<PaginatedResult<User>> {
        return this.buildPaginatedResult(page, sequelize.where(sequelize.fn('lower', sequelize.col('username')), {[Op.like]: username + '%'}));
    }

    async findOneByUsername(username: string): Promise<User> {
        const model = await UserModel.findOne({
            where: {
                username
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

    async findWithRole(roleId: string): Promise<User[]> {
        return this.buildResults(await UserModel.findAll({
            include: [{
                as: 'roles',
                model: RoleModel,
                where: {_id: roleId}
            }]
        }));
    }

}