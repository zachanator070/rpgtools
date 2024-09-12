import {Repository} from "./repository.js";
import {Monster} from "../../domain-entities/monster.js";

export interface MonsterRepository extends Repository<Monster>{}