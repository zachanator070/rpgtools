import {
    FILTER_CONDITION_OPERATOR_EQUALS,
    FILTER_CONDITION_OPERATOR_IN,
    FILTER_CONDITION_REGEX,
    FilterCondition
} from "../filter-condition";
import {injectable} from "inversify";
import mongoose from "mongoose";

@injectable()
export default class FilterFactory{

    public build(conditions: FilterCondition[], useIdObjects=false){

        const filter: any = {};
        for (let condition of conditions) {
            if (condition.operator === FILTER_CONDITION_OPERATOR_IN) {
                filter[condition.field] = { $in: this.getConditionValue(condition, useIdObjects) };
            } else if (condition.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
                filter[condition.field] = this.getConditionValue(condition, useIdObjects);
            } else if (condition.operator === FILTER_CONDITION_REGEX) {
                filter[condition.field] = { $regex: this.getConditionValue(condition, useIdObjects), $options: "i" };
            } else {
                throw new Error(`Unsupported filter operator: ${condition.operator}`);
            }
        }
        return filter;

    }

    private getConditionValue(condition: FilterCondition, useIdObjects: boolean){
       if(condition.field === "_id" && useIdObjects)
            return new mongoose.Types.ObjectId(condition.value);
        return condition.value
    }
}