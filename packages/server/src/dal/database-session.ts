

export class DatabaseSession {
    sqlSession: any;

    constructor(sqlSession: any) {
        this.sqlSession = sqlSession;

    }

    async commit() {
        if (this.sqlSession) {
            await this.sqlSession.commit();
        }
    }
}