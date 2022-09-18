import { Image } from "../../../domain-entities/image";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {ImageRepository} from "../../repository/image-repository";

@injectable()
export class InMemoryImageRepository extends AbstractInMemoryRepository<Image> implements ImageRepository{}
