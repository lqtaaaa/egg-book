'use strict';

const Service = require('egg').Service;

class HomeService extends Service {
    async user() {
        const { ctx, app } = this;
        const QUERY_STR = 'id, name';
        let sql = `select ${QUERY_STR} from list`; // 获取 id 的 sql 语句
        try {
            const result = await app.mysql.query(sql); // mysql 实例已经挂载到 app 对象下，可以通过 app.mysql 获取到。
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    // 新增
    async addUser(name) {
        const { ctx, app } = this;
        try {
            // 给list 表新增一条数据
            const result = await app.mysql.insert('list', { name });
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    // 编辑
    async editUser(id, name) {
        const { ctx, app } = this;
        try {
            const result = await app.mysql.update('list', { name }, {
                where: { id }
            });
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    // 删除
    async deleteUser(id) {
        const { ctx, app } = this;
        try {
            const result = await app.mysql.delete('list', { id });
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
}
module.exports = HomeService;
