import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin} from "sequelize";
import WorldModel from "./world-model";
import {defaultAttributes} from "./default-attributes";
import AgeModel from "./calendar/age-model";
import PermissionControlledModel from "./permission-controlled-model";
import {WORLD} from "@rpgtools/common/src/type-constants";


export default class CalendarModel extends PermissionControlledModel {

    declare name: string;
    declare worldId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    getAges: HasManyGetAssociationsMixin<AgeModel>;
    setAges: HasManySetAssociationsMixin<AgeModel, string>;

    static connect() {
        CalendarModel.hasMany(AgeModel, {as: 'ages'});
        CalendarModel.belongsTo(WorldModel);
    }
}