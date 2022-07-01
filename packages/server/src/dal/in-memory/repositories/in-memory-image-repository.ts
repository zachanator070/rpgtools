import { Image } from "../../../domain-entities/image";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryImageRepository extends AbstractInMemoryRepository<Image> {}
