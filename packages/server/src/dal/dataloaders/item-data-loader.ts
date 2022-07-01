import { GraphqlDataloader } from "../graphql-dataloader";
import { Item } from "../../domain-entities/item";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ItemRepository } from "../../types";
import { ItemAuthorizationRuleset } from "../../security/ruleset/item-authorization-ruleset";

@injectable()
export class ItemDataLoader extends GraphqlDataloader<Item> {
	@inject(INJECTABLE_TYPES.ItemRepository)
	repository: ItemRepository;
	@inject(INJECTABLE_TYPES.ItemAuthorizationRuleset)
	ruleset: ItemAuthorizationRuleset;
}
