import {ModelStatic} from "sequelize";
import {DomainEntity, EntityFactory} from "../../../types";
import SqlModel from "../models/sql-model";


export default abstract class AbstractSqlRepository<T extends DomainEntity, M extends SqlModel> {

    abstract modelFactory(entity?: T): Promise<M>;
    abstract entityFactory: EntityFactory<T, any, M>;
    abstract staticModel: ModelStatic<any>;

    async create(entity: T): Promise<void> {
        const model = await this.modelFactory(entity)
        entity._id = model._id;
        await model.save();
    }

    async delete(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        await model.destroy();
    }

    async update(entity: T): Promise<void> {
        const model = await this.modelFactory(entity);
        await model.save();
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
        return this.entityFactory.fromSqlModel(result);
    }

    async buildResults(models: M[]){
        const results = [];
        for(let model of models) {
            results.push(await this.entityFactory.fromSqlModel(model));
        }
        return results;
    }
}