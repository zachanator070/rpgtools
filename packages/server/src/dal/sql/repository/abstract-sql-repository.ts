import sequelize, {ModelStatic} from "sequelize";
import {DomainEntity, EntityFactory} from "../../../types";
import SqlModel from "../models/sql-model";
import {PaginatedResult} from "../../paginated-result";
import {injectable} from "inversify";
import {v4} from "uuid";

@injectable()
export default abstract class AbstractSqlRepository<T extends DomainEntity, M extends SqlModel> {

    abstract modelFactory(entity?: T): Promise<M>;
    abstract entityFactory: EntityFactory<T, M>;
    abstract staticModel: ModelStatic<any>;

    PAGE_LIMIT = 10;

    async create(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        model._id = v4();
        await model.save();
        entity._id = model._id;
        await this.updateAssociations(entity, model);
    }

    async delete(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        await model.destroy();
        await this.deleteAssociations(entity, model);
    }

    async update(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        model.isNewRecord = false;
        await model.save();
        await this.updateAssociations(entity, model);
    }

    async updateAssociations(entity: T, model: M) {
    }

    async deleteAssociations(entity: T, model: M) {
    }

    async findAll(): Promise<T[]> {
        const foundModels = await this.staticModel.findAll();
        return this.buildResults(foundModels);
    }

    async findByIds(id: string[]): Promise<T[]> {
        const foundModels = await this.staticModel.findAll({
            where: {
                _id: id
            }
        });
        return this.buildResults(foundModels);
    }

    async findOneById(id: string): Promise<T> {
        const result =  await this.staticModel.findOne({
            where: {
                _id: id
            }
        });
        if(result) {
            return this.entityFactory.fromSqlModel(result);
        }
    }

    async buildResults(models: M[]){
        const results = [];
        for(let model of models) {
            results.push(await this.entityFactory.fromSqlModel(model));
        }
        return results;
    }

    async buildPaginatedResult(page: number, filter: any, sort?: string, results?: M[], totalCount?: number): Promise<PaginatedResult<T>> {
        const order = [];
        if(sort) {
            order.push(sequelize.col(sort));
        }
        if(!page) {
            page = 1;
        }

        if(!results) {
            results = await this.staticModel.findAll({
                where: filter,
                limit: this.PAGE_LIMIT,
                offset: (page - 1) * this.PAGE_LIMIT,
                order: order
            });
            totalCount = await this.staticModel.count({
                where: filter
            });
        } else if(totalCount === undefined || totalCount === null) {
            throw Error('totalCount must be supplied if results are passed in')
        }

        const totalPages = Math.ceil(totalCount / this.PAGE_LIMIT);

        return {
            totalDocs: totalCount,
            limit: this.PAGE_LIMIT,
            page,
            pagingCounter: page * this.PAGE_LIMIT,
            hasPrevPage: page > 0,
            totalPages,
            hasNextPage: page < totalPages,
            prevPage: page > 0 ? page -1 : null,
            nextPage: page < totalPages ? page +1 : null,
            docs: await this.buildResults(results)
        };
    }
}