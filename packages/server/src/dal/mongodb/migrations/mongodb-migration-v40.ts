import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {MongoClient, Db, Document, Collection} from 'mongodb';
import MongodbDbEngine from "../mongodb-db-engine";
import EntityMapper from "../../../domain-entities/entity-mapper";
import {
    ALL_WIKI_TYPES,
    GAME,
    MODEL,
    ROLE,
    SERVER_CONFIG,
    USER,
    WIKI_FOLDER,
    WORLD
} from "@rpgtools/common/src/type-constants";
import {ServerConfigRepository} from "../../repository/server-config-repository";
import {DatabaseContext} from "../../database-context";
import {v4} from 'uuid';
import {ObjectId} from "bson";

@injectable()
export default class MongoDbMigrationV40 {
    @inject(INJECTABLE_TYPES.ServerConfigRepository)
    serverConfigRepository: ServerConfigRepository;

    @inject(INJECTABLE_TYPES.EntityMapper)
    entityMapper: EntityMapper;

    async migrate(dbEngine: MongodbDbEngine, databaseContext: DatabaseContext) {
        const client = new MongoClient(dbEngine.getConnectionString());
        await client.connect();
        const db = client.db(dbEngine.dbName);
        const oldServerConfig = await db.collection('serverconfigs').findOne();
        if (oldServerConfig && oldServerConfig.version < '4.0') {
            console.log('Migrating mongodb schema to version 4.0');

            await this.migratePermissionAssignments(db);
            await this.migrateIds(db);

            const newServerConfig = await this.serverConfigRepository.findOne();
            newServerConfig.version = '4.0';
            await databaseContext.serverConfigRepository.update(newServerConfig);
        }
        await client.close();
    }

    // migrate from ObjectIds to uuids

    async migrateIds(db: Db) {
        await this.migrateChunkIds(db);
        await this.migrateGameIds(db);
        await this.migrateImageIds(db);
        await this.migrateModelIds(db);
        await this.migratePinIds(db);
        await this.migrateRoleIds(db);
        await this.migrateServerConfigIds(db);
        await this.migrateUserIds(db);
        await this.migrateWikiFolderIds(db);
        await this.migrateWikiPageIds(db);
        await this.migrateWorldIds(db);
        await this.migrateFileIds(db);
    }

    async migrateDocumentId(doc: Document, collection: Collection) {
        const originalId = doc._id;
        const newId = v4();
        delete doc._id;
        await collection.insertOne({
            // @ts-ignore
            _id: newId,
            ...doc
        });
        await collection.deleteOne({_id: originalId});
        doc._id = newId;
    }

    async migrateEmbeddedDocumentIds(doc: Document, attribute: string) {
        const embeddedDocs = doc[attribute];
        if(!embeddedDocs){
            return;
        }
        const newDocs = [];
        for(let embeddedDoc of embeddedDocs) {
            delete embeddedDoc._id;
            newDocs.push({
                _id: v4(),
                ...embeddedDoc
            });
        }
        doc[attribute] = newDocs;
    }

    async migrateAclPrincipalId(db: Db, oldId: ObjectId, newId: string) {
        const roleCollection = db.collection('roles');
        const gameCollection = db.collection('games');
        const modelCollection = db.collection('models');
        const serverConfigCollection = db.collection('serverconfigs');
        const wikiFolderCollection = db.collection('wikifolders');
        const wikiPageCollection = db.collection('wikipages');
        const worldCollection = db.collection('worlds');

        await gameCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
        await modelCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
        await roleCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
        await serverConfigCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
        await wikiFolderCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
        await wikiPageCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
        await worldCollection.updateMany({acl: {$exists: true}}, {$set: {'acl.$[aclEntry].principal': newId}}, {arrayFilters: [{'aclEntry.principal': {$eq: oldId}}]});
    }

    async migrateChunkIds(db: Db) {
        const chunkCollection = db.collection('chunks');
        const imageCollection = db.collection('images');
        const allChunks = await chunkCollection.find().toArray();
        for(let chunk of allChunks) {
            const originalId = chunk._id;
            await this.migrateDocumentId(chunk, chunkCollection);
            await imageCollection.updateOne({chunks: originalId}, {$set:{'chunks.$': chunk._id}})
        }
    }

    async migrateGameIds(db: Db) {
        const gameCollection = db.collection('games');
        const allGames = await gameCollection.find().toArray();
        for(let game of allGames) {
            await this.migrateDocumentId(game, gameCollection);
            await this.migrateEmbeddedDocumentIds(game, 'characters');
            for(let character of game.characters) {
                await this.migrateEmbeddedDocumentIds(character, 'attributes');
            }
            await this.migrateEmbeddedDocumentIds(game, 'strokes');
            for(let stroke of game.strokes) {
                await this.migrateEmbeddedDocumentIds(stroke, 'path');
            }
            await this.migrateEmbeddedDocumentIds(game, 'fog');
            for(let fog of game.fog) {
                await this.migrateEmbeddedDocumentIds(fog, 'path');
            }
            await this.migrateEmbeddedDocumentIds(game, 'messages');
            await this.migrateEmbeddedDocumentIds(game, 'models');
            await this.migrateEmbeddedDocumentIds(game, 'acl');
            await gameCollection.updateOne({_id: game._id}, {$set: game});
        }
    }

    async migrateImageIds(db: Db) {
        const imageCollection = db.collection('images');
        const chunkCollection = db.collection('chunks');
        const wikiCollection = db.collection('wikipages');
        const allImages = await imageCollection.find().toArray();
        for(let image of allImages) {
            const oldId = image._id;
            await this.migrateDocumentId(image, imageCollection);
            await imageCollection.updateOne({icon: oldId}, {$set: {icon: image._id}});
            await chunkCollection.updateMany({image: oldId}, {$set: {image: image._id}});
            await wikiCollection.updateMany({mapImage: oldId}, {$set: {mapImage: image._id}});
            await wikiCollection.updateMany({coverImage: oldId}, {$set: {coverImage: image._id}});
        }
    }

    async migrateModelIds(db: Db) {
        const modelCollection = db.collection('models');
        const gameCollection = db.collection('games');
        for(let model of await modelCollection.find().toArray()) {
            const oldId = model._id;
            await this.migrateDocumentId(model, modelCollection);
            await gameCollection.updateMany({'models.model': oldId}, {$set:{'models.$.model': model._id}});
            await this.migrateEmbeddedDocumentIds(model, 'acl');
            await modelCollection.updateOne({_id: model._id}, {$set: model});
        }
    }

    async migratePinIds(db: Db) {
        const pinCollection = db.collection('pins');
        for(let pin of await pinCollection.find().toArray()) {
            await this.migrateDocumentId(pin, pinCollection);
        }
    }

    async migrateRoleIds(db: Db) {
        const roleCollection = db.collection('roles');
        const userCollection = db.collection('users');
        for(let role of await roleCollection.find().toArray()) {
            const oldId = role._id;
            await this.migrateDocumentId(role, roleCollection);
            await this.migrateAclPrincipalId(db, oldId, role._id as any);
            await userCollection.updateMany({roles: oldId}, {$set: {'roles.$': role._id}});
            await this.migrateEmbeddedDocumentIds(role, 'acl');
            await roleCollection.updateOne({_id: role._id}, {$set: role});
        }
    }

    async migrateServerConfigIds(db: Db) {
        const configCollection = db.collection('serverconfigs');
        const config = await configCollection.findOne();
        await this.migrateDocumentId(config, configCollection);
        await this.migrateEmbeddedDocumentIds(config, 'acl');
        await configCollection.updateOne({_id: config._id}, {$set: config});
    }

    async migrateUserIds(db: Db) {
        const userCollection = db.collection('users');
        const gameCollection = db.collection('games');
        const configCollection = db.collection('serverconfigs');
        for(let user of await userCollection.find().toArray()) {
            const oldId = user._id;
            await this.migrateDocumentId(user, userCollection);
            await this.migrateAclPrincipalId(db, oldId, user._id.toString());
            await gameCollection.updateMany({host: oldId}, {$set: {host: user._id}});
            await gameCollection.updateMany({characters: {player: oldId}}, {$set: {host: user._id}});
            await configCollection.updateMany({adminUsers: oldId}, {$set: {'adminUsers.$': user._id}});
        }
    }

    async migrateWikiFolderIds(db: Db) {
        const wikiFolderCollection = db.collection('wikifolders');
        const worldCollection = db.collection('worlds');
        for(let wikiFolder of await wikiFolderCollection.find().toArray()) {
            const oldId = wikiFolder._id;
            await this.migrateDocumentId(wikiFolder, wikiFolderCollection);
            await wikiFolderCollection.updateOne({children: oldId}, {$set: {'children.$': wikiFolder._id}});
            await this.migrateEmbeddedDocumentIds(wikiFolder, 'acl');
            await wikiFolderCollection.updateOne({_id: wikiFolder._id}, {$set: wikiFolder});
            await worldCollection.updateMany({rootFolder: oldId}, {$set: {rootFolder: wikiFolder._id}});
        }
    }

    async migrateWikiPageIds(db: Db) {
        const wikiPageCollection = db.collection('wikipages');
        const wikiFolderCollection = db.collection('wikifolders');
        const pinCollection = db.collection('pins');
        const worldCollection = db.collection('worlds');
        const gameCollection = db.collection('games');
        for(let wikiPage of await wikiPageCollection.find().toArray()) {
            const oldId = wikiPage._id;
            await this.migrateDocumentId(wikiPage, wikiPageCollection);
            await wikiFolderCollection.updateOne({pages: oldId}, {$set: {'pages.$': wikiPage._id}});
            await pinCollection.updateMany({page: oldId}, {$set: {page: wikiPage._id}});
            await pinCollection.updateMany({map: oldId}, {$set: {map: wikiPage._id}});
            await worldCollection.updateOne({wikiPage: oldId}, {$set: {wikiPage: wikiPage._id}});
            await gameCollection.updateMany({'models.wiki': oldId}, {$set: {'models.$.wiki': wikiPage._id}});
            await gameCollection.updateMany({map: oldId}, {$set: {map: wikiPage._id}});
            await this.migrateEmbeddedDocumentIds(wikiPage, 'acl');
            await wikiPageCollection.updateOne({_id: wikiPage._id}, {$set: wikiPage});
        }
    }

    async migrateWorldIds(db: Db) {
        const worldCollection = db.collection('worlds');
        const wikiPageCollection = db.collection('wikipages');
        const wikiFolderCollection = db.collection('wikifolders');
        const pinCollection = db.collection('pins');
        const gameCollection = db.collection('games');
        const modelCollection = db.collection('models');
        const imageCollection = db.collection('images');
        const roleCollection = db.collection('roles');
        const userCollection = db.collection('users');
        for(let world of await worldCollection.find().toArray()) {
            const oldId = world._id;
            await this.migrateDocumentId(world, worldCollection);
            await pinCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await wikiPageCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await wikiFolderCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await gameCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await modelCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await imageCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await roleCollection.updateMany({world: oldId}, {$set: {world: world._id}});
            await userCollection.updateMany({currentWorld: oldId}, {$set: {currentWorld: world._id}});

            await this.migrateEmbeddedDocumentIds(world, 'acl');
            await worldCollection.updateOne({_id: world._id}, {$set: world});
        }
    }

    async migrateFileIds(db: Db) {
        const filesCollection = db.collection('fs.files');
        const wikiPageCollection = db.collection('wikipages');
        const chunkCollection = db.collection('chunks');
        const modelCollection = db.collection('models');
        for(let file of await filesCollection.find().toArray()) {
            const oldId = file._id;
            const newId = v4();
            await filesCollection.updateOne({_id: oldId}, {$set: {metadata: {_id: newId}}});
            await wikiPageCollection.updateMany({contentId: oldId}, {$set: {contentId: newId}});
            await chunkCollection.updateMany({fileId: oldId.toString()}, {$set: {fileId: newId}});
            await modelCollection.updateMany({fileId: oldId.toString()}, {$set: {fileId: newId}});
        }
    }

    // migrate permission assignments to be embedded

    async migratePermissionAssignments(db: Db) {

        const permissionAssignments = await db.collection('permissionassignments').find({}).toArray();
        for (let permissionAssignment of permissionAssignments) {

            let collection = null;
            if(permissionAssignment.subjectType === WORLD) {
                collection = db.collection('worlds');
            } else if(permissionAssignment.subjectType === ROLE) {
                collection = db.collection('roles');
            } else if(permissionAssignment.subjectType === GAME) {
                collection = db.collection('games');
            }  else if(ALL_WIKI_TYPES.includes(permissionAssignment.subjectType)){
                collection = db.collection('wikipages');
            } else if(permissionAssignment.subjectType === WIKI_FOLDER) {
                collection = db.collection('wikifolders');
            } else if(permissionAssignment.subjectType === SERVER_CONFIG) {
                collection = db.collection('serverconfigs');
            } else if(permissionAssignment.subjectType === MODEL) {
                collection = db.collection('models');
            } else {
                throw new Error(`Unable to migrate permissions. Unknown permission subject type: ${permissionAssignment.subjectType}`);
            }
            const entity = await collection.findOne({_id: new ObjectId(permissionAssignment.subject)});
            if(!entity.acl) {
                entity.acl = [];
            }

            const usersWithPermission = await db.collection('users').find({permissions: permissionAssignment._id}).toArray();
            for (let user of usersWithPermission) {
                let found = false;
                for(let entry of entity.acl) {
                    if(entry.permission === permissionAssignment.permission && entry.principal.toString() === user._id.toString()){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    entity.acl.push({
                        permission: permissionAssignment.permission,
                        principal: user._id,
                        principalType: USER
                    });
                }
            }

            const rolesWithPermission = await db.collection('roles').find({permissions: permissionAssignment._id}).toArray();
            for (let role of rolesWithPermission) {
                let found = false;
                for(let entry of entity.acl) {
                    if(entry.permission === permissionAssignment.permission && entry.principal.toString() === role._id.toString()){
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    entity.acl.push({
                        permission: permissionAssignment.permission,
                        principal: role._id,
                        principalType: ROLE
                    });
                }
            }
            await collection.updateOne({_id: entity._id}, {$set: entity});
        }

        await db.collection('users').updateMany({}, {$unset: {permissions: ''}});
        await db.collection('roles').updateMany({}, {$unset: {permissions: ''}});

        if((await db.listCollections().toArray()).includes({name: 'permissionassignments'})) {
            await db.collection('permissionassignments').drop();
        }
    }
}