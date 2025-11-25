import { Image } from "../../../domain-entities/image.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ImageRepository} from "../../repository/image-repository.js";

@injectable()
export class InMemoryImageRepository extends AbstractInMemoryRepository<Image> implements ImageRepository{}
