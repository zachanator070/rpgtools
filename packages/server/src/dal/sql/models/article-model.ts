import {Model, Sequelize} from "sequelize";


export default class ArticleModel extends Model {
    static connect(connection: Sequelize) {
        ArticleModel.init({}, {sequelize: connection});
    }
}