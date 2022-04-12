import {
    FILTER_CONDITION_OPERATOR_EQUALS,
    FILTER_CONDITION_OPERATOR_IN,
    FILTER_CONDITION_REGEX,
    FilterCondition
} from "../filter-condition";
import {injectable} from "inversify";
import {ObjectId} from 'bson';

@injectable()
export default class FilterFactory {

    public build(conditions: FilterCondition[], useIdObjects = false) {

        const filter: any = {};
        for (let condition of conditions) {
            if (condition.operator === FILTER_CONDITION_OPERATOR_IN) {
                filter[condition.field] = {$in: this.getConditionValue(condition, useIdObjects)};
            } else if (condition.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
                filter[condition.field] = this.getConditionValue(condition, useIdObjects);
            } else if (condition.operator === FILTER_CONDITION_REGEX) {
                filter[condition.field] = {$regex: this.getConditionValue(condition, useIdObjects), $options: "i"};
            } else {
                throw new Error(`Unsupported filter operator: ${condition.operator}`);
            }
        }
        return filter;

    }

    private checkIdLength(id: string): void {
        if (id.length !== 24) {
            throw new Error(`ID ${id} must be at least 24 characters`);
        }
    }

    private getConditionValue(condition: FilterCondition, useIdObjects: boolean): any{
        if (condition.field === "_id") {
            if (typeof condition.value === "string") {
                this.checkIdLength(condition.value)
                if (useIdObjects) {
                    return new ObjectId(condition.value);
                }
            } else if (Array.isArray(condition.value)) {
                for(let id of condition.value) {
                    this.checkIdLength(id)
                }
            }
        }
        return condition.value
    }
}