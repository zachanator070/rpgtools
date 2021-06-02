import { Pin } from "../../../domain-entities/pin";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryPinRepository extends AbstractInMemoryRepository<Pin> {}
