import { Monster } from "../../../domain-entities/monster.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {MonsterRepository} from "../../repository/monster-repository.js";
import {inMemoryWikiPageStore} from "./in-memory-wiki-page-store.js";

@injectable()
export class InMemoryMonsterRepository extends AbstractInMemoryRepository<Monster> implements MonsterRepository{
	items = inMemoryWikiPageStore as Map<string, Monster>;
}
