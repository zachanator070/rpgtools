import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory, WikiPageDocument} from "../../types";
import {WikiPage} from "../wiki-page";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";
import {Article} from "../article";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import ArticleFactory from "./article-factory";
import EntityMapper from "../entity-mapper";
import {ALL_WIKI_TYPES} from "@rpgtools/common/src/type-constants";


@injectable()
export default class WikiPageFactory implements EntityFactory<WikiPage, WikiPageDocument, WikiPageModel> {

    @inject(INJECTABLE_TYPES.ArticleFactory)
    articleFactory: ArticleFactory;

    @inject(INJECTABLE_TYPES.EntityMapper)
    entityMapper: EntityMapper;

    build({
              _id,
              name,
              world,
              coverImage,
              contentId,
              acl,
              relatedWikis
          }: {
            _id?: string,
            name: string,
            world: string,
            coverImage: string,
            contentId: string,
            acl: AclEntry[],
            relatedWikis: string[],
        }): WikiPage {
        const article = new Article(this.articleFactory, new WikiPageAuthorizationPolicy());
        article._id = _id;
        article.name = name;
        article.world = world;
        article.coverImage = coverImage;
        article.contentId = contentId;
        article.acl = acl;
        article.relatedWikis = relatedWikis;
        return article;
    }

    fromMongodbDocument(doc: WikiPageDocument): WikiPage {
        if(!ALL_WIKI_TYPES.includes(doc.type)) {
            throw new Error(`Cannot create mongodb document from wiki type ${doc.type}`)
        }
        // this should be a safe cast b/c of the type checking above
        return this.entityMapper.map(doc.type).factory.fromMongodbDocument(doc) as WikiPage;
    }

    async fromSqlModel(model: WikiPageModel): Promise<WikiPage> {
        if(!ALL_WIKI_TYPES.includes(model.type)) {
            throw new Error(`Cannot create mongodb document from wiki type ${model.type}`)
        }
        // this should be a safe cast b/c of the type checking above
        return (await this.entityMapper.map(model.type).factory.fromSqlModel(model)) as WikiPage;
    }

}