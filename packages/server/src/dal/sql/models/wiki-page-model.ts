import {DataTypes, Model, Sequelize} from "sequelize";
import {WIKI_PAGE} from "@rpgtools/common/src/type-constants";


export default class WikiPageModel extends Model {
    static connect(connection: Sequelize): void {
        WikiPageModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {sequelize: connection, modelName: WIKI_PAGE});
    }
}