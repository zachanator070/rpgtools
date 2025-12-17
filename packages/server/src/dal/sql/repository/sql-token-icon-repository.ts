import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import {TokenIcon} from "../../../domain-entities/token-icon.js";
import TokenIconModel from "../models/token-icon-model.js";
import {TokenIconRepository} from "../../repository/token-icon-repository.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import TokenIconFactory from "../../../domain-entities/factory/token-icon-factory.js";
import { PaginatedResult } from "../../paginated-result.js";
import sequelize, { Op } from "sequelize";


@injectable()
export default class SqlTokenIconRepository extends AbstractSqlRepository<TokenIcon, TokenIconModel> implements TokenIconRepository {

    staticModel = TokenIconModel;

    @inject(INJECTABLE_TYPES.TokenIconFactory)
    entityFactory: TokenIconFactory;

    async modelFactory(entity: TokenIcon | undefined): Promise<TokenIconModel> {
        return TokenIconModel.build({
            _id: entity._id,
            imageId: entity.imageId,
            worldId: entity.worldId,
            name: entity.name
        });
    }

    async updateAssociations(entity: TokenIcon, model: TokenIconModel) {
        // No associations to update
    }

    async getAllPaginated(page: number | undefined, name: string | undefined, worldId: string): Promise<PaginatedResult<TokenIcon>> {
        const filters: any = [{ worldId }];
        if(name) {
            filters.push(sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name.toLowerCase() + '%'));
        }
        return this.buildPaginatedResult(page, {[Op.and]: filters}, 'name');
    }

}
