

export class DatabaseSession {
    mongodbSession: any;
    sqlSession: any;

    constructor(mongodbSession: any, sqlSession: any) {
        this.mongodbSession = mongodbSession;
        this.sqlSession = sqlSession;

        if (this.mongodbSession) {
            this.mongodbSession.startTransaction();
        }
    }

    async commit() {
        if (this.mongodbSession) {
            this.mongodbSession.commitTransaction();
            this.mongodbSession.endSession();
        } else if (this.sqlSession) {
            await this.sqlSession.commit();
        }
    }
}