import {redisClient} from "../redis-client";
import {GridFSBucket} from "mongodb";
import mongoose from "mongoose";
import mongodb from "mongodb";

export const gridFsRedisMiddleware = (key) => (req, res, next) => {
    const lookupKey = req.params[key];

    const searchGFS = () => {
        const gfs = new GridFSBucket(mongoose.connection.db);
        const searchParams = {};
        if(key === 'id'){
            searchParams._id = new mongodb.ObjectID(req.params.id);
        }
        else{
            searchParams[key] = req.params[key];
        }
        gfs.find(searchParams).next( (err, file) => {

            if(err){
                return res.status(500).send();
            }
            if(file === null ){
                return res.status(404).send();
            }
            const readStream = gfs.openDownloadStream(file._id);
            res.set('Content-Type', file.contentType);
            res.setHeader('Content-disposition', `attachment; filename=${file.filename}`);
            if(redisClient){
                // write file to cache and store for an hour, then write to response
                return readStream
                    .pipe(redisClient.writeThrough(lookupKey, 60 * 60))
                    .pipe(res);
            }
            return readStream.pipe(res);

        });
    }

    if(redisClient){
        redisClient.exists(lookupKey, function(err, exists) {
            if (err) return next(err);

            if (exists)
                return redisClient.readStream(lookupKey).pipe(res);

            searchGFS();

        });
    }
    else {
        searchGFS();
    }

};