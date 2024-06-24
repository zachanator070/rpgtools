import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Article} from "../article";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {ArticleDocument} from "../../dal/mongodb/models/article";
import AclFactory from "./acl-factory";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";


@injectable()
export default class ArticleFactory implements EntityFactory<Article, ArticleDocument, WikiPageModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

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
        relatedWikis: string[]
    }): Article {
        const article = new Article(this, new WikiPageAuthorizationPolicy());
        article._id = _id;
        article.name = name;
        article.world = world;
        article.coverImage = coverImage;
        article.contentId = contentId;
        article.acl = acl;
        article.relatedWikis = relatedWikis;
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
        article.relatedWikis = doc.relatedWikis.map(_id => _id.toString());
        return article;
    }

    async fromSqlModel(model?: WikiPageModel): Promise<Article> {
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            coverImage: model.coverImageId,
            contentId: model.contentId,
            acl: await Promise.all(
                (await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            ),
            relatedWikis: (await Promise.all((await model.getRelatedWikis()).map(wiki => wiki._id)))
        });
    }

}
