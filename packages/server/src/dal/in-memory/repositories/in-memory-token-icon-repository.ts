import { TokenIcon } from "../../../domain-entities/token-icon.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {TokenIconRepository} from "../../repository/token-icon-repository.js";

@injectable()
export default class InMemoryTokenIconRepository extends AbstractInMemoryRepository<TokenIcon> implements TokenIconRepository{}
