// 操作数据库用户信息

const Service = require('egg').Service;

class UserService extends Service {
    // 通过用户名获取用户信息
    async getUserByName(username) {
        const { app } = this;
        try {
            const result = await app.mysql.get('user',{ username });
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    // 注册用户
    async register(params) {
        const { app } = this;
        try {
            const result = await app.mysql.insert('user', params);
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    // 更新用户信息
    async updateUserInfo(params) {
        const { app } = this;
        try {
            const result = await app.mysql.update('user', {
                ...params
            }, {
                id: params.id
            });
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    // 修改用户密码
    async modifyPass (params) {
        const { ctx, app } = this;
        try {
            let result = await app.mysql.update('user', {
                ...params
            }, {
                id: params.id
            });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = UserService;
