import {ModelStatic} from "sequelize";
import {DomainEntity, EntityFactory} from "../../../types";
import SqlModel from "../models/sql-model";
import {DatabaseSession} from "../../database-session";
import {PaginatedResult} from "../../paginated-result";
import {injectable} from "inversify";

@injectable()
export default abstract class AbstractSqlRepository<T extends DomainEntity, M extends SqlModel> {

    abstract modelFactory(entity?: T): Promise<M>;
    abstract entityFactory: EntityFactory<T, any, M>;
    abstract staticModel: ModelStatic<any>;

    PAGE_LIMIT = 10;

    setDatabaseSession(session: DatabaseSession): void {
    }

    async create(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        try {
            await model.save();
        } catch (e) {
            console.error(`Error while saving to database ${e.message()}`);
        }
        entity._id = model._id;
    }

    async delete(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        await model.destroy();
    }

    async update(entity: T): Promise<void> {
        const model = await this.staticModel.findOne({where: {_id: entity._id}});
        try {
            await model.update(this.modelFactory(entity), {where: {_id: entity._id}});
        } catch (e) {
            console.error(`Error while updating to database ${e.message()}`);
        }
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

    async buildPaginatedResult(page: number, filter: any): Promise<PaginatedResult<T>> {
        const results = await this.staticModel.findAll({
            where: filter,
            limit: this.PAGE_LIMIT,
            offset: page * this.PAGE_LIMIT,
        });

        const count = await this.staticModel.count({
            where: filter
        });

        const totalPages = count / this.PAGE_LIMIT;

        return {
            totalDocs: count,
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