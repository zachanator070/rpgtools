import { Monster } from "../../../domain-entities/monster.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {MonsterRepository} from "../../repository/monster-repository.js";

@injectable()
export class InMemoryMonsterRepository extends AbstractInMemoryRepository<Monster> implements MonsterRepository{}
