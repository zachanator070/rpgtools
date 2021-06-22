import { GraphqlDataloader } from "../graphql-dataloader";
import { Item } from "../../domain-entities/item";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ItemRepository } from "../../types";
import { ItemAuthorizationRuleset } from "../../security/item-authorization-ruleset";

export class ItemDataLoader extends GraphqlDataloader<Item> {
	constructor(@inject(INJECTABLE_TYPES.ItemRepository) repo: ItemRepository) {
		super(repo, new ItemAuthorizationRuleset());
	}
}
