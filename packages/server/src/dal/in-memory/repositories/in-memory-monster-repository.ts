import { Monster } from "../../../domain-entities/monster";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {MonsterRepository} from "../../repository/monster-repository";

@injectable()
export class InMemoryMonsterRepository extends AbstractInMemoryRepository<Monster> implements MonsterRepository{}
