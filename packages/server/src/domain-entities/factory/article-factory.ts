import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Article} from "../article";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {ArticleDocument} from "../../dal/mongodb/models/article";
import AclFactory from "./acl-factory";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import ArticleModel from "../../dal/sql/models/article-model";
import AclEntryModel from "../../dal/sql/models/acl-entry-model";


@injectable()
export default class ArticleFactory implements EntityFactory<Article, ArticleDocument, ArticleModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build({
          _id,
          name,
          world,
          coverImage,
          contentId,
          acl
      }: {
        _id?: string,
        name: string,
        world: string,
        coverImage: string,
        contentId: string,
        acl: AclEntry[]
    }): Article {
        const article = new Article(this, new WikiPageAuthorizationPolicy());
        article._id = _id;
        article.name = name;
        article.world = world;
        article.coverImage = coverImage;
        article.contentId = contentId;
        article.acl = acl;
        return article;
    }

    fromMongodbDocument(doc: ArticleDocument): Article {
        const article = new Article(this, new WikiPageAuthorizationPolicy());
        article._id = doc._id && doc._id.toString();
        article.name = doc.name;
        article.world = doc.world && doc.world.toString();
        article.coverImage = doc.coverImage && doc.coverImage.toString();
        article.contentId = doc.contentId && doc.contentId.toString();
        article.acl = doc.acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
        return article;
    }

    async fromSqlModel(model: ArticleModel): Promise<Article> {
        const page = await model.getWikiPage();
        return this.build({
            _id: model._id,
            name: page.name,
            world: page.worldId,
            coverImage: page.coverImageId,
            contentId: page.contentId,
            acl: await Promise.all(
                (await (await model.getWikiPage()).getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            )
        });
    }

}