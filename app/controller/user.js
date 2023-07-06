// 用户相关代码

const Controller = require('egg').Controller;
// 默认头像，放在 user.js 的最外，部避免重复声明。
const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'
class UserController extends Controller {
    // 注册
    async register() {
        const { ctx } = this;
        const { username, password } = ctx.request.body;
        // 判空操作
        if (!username ||!password) {
            ctx.body = {
                code: 500,
                msg: '用户名或密码不能为空',
                data: null
            };
            return;
        }
        // 验证数据库中是否有该帐号名
        const userInfo = await ctx.service.user.getUserByName(username)
        // 判断是否已经注册 提示
        if (userInfo && userInfo.id) {
            ctx.body = {
                code: 500,
                msg: '该帐号已被注册',
                data: null
            };
            return;
        }
        // 注册操作
        const result = await ctx.service.user.register({
            username,
            password,
            avatar: defaultAvatar,
            signature: '一夜暴富！！'
        });
        if (result) {
            ctx.body = {
                code: 200,
                msg: '注册成功',
                data: null
            };
        } else {
            ctx.body = {
                code: 500,
                msg: '注册失败',
                data: null
            };
        }
    }
    // 登录
    async login() {
        const { ctx,app } = this;
        const { username, password } = ctx.request.body;
        // 判空操作
        if (!username ||!password) {
            ctx.body = {
                code: 500,
                msg: '用户名或密码不能为空',
                data: null
            };
            return;
        }
        // 验证数据库中是否有该帐号名
        const userInfo = await ctx.service.user.getUserByName(username)
        // 判断是否已经注册 提示
        if (!userInfo) {
            ctx.body = {
                code: 500,
                msg: '该帐号不存在',
                data: null
            };
            return;
        }
        // 找到用户，并且判断输入密码与数据库中用户密码。
        if (userInfo && password != userInfo.password) {
            ctx.body = {
                code: 500,
                msg: '账号密码错误',
                data: null
            }
            return
        }
        // 生成 token 加盐
        // app.jwt.sign 方法接受两个参数，第一个为对象，对象内是需要加密的内容；第二个是加密字符串，上文已经提到过。
        const token = app.jwt.sign({
            id: userInfo.id,
            username: userInfo.username,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // token 有效期为 24 小时
        }, app.config.jwt.secret);

        ctx.body = {
            code: 200,
            message: '登录成功',
            data: {
                token
            },
        };
    }
    // 获取用户信息
    async getUserInfo() {
        const { ctx } = this;
        // 通过 app.jwt.verify + 加密字符串 解析出 token 的值
        const decode = ctx.decode;
        // 通过 getUserByName 方法，以用户名 decode.username 为参数，从数据库获取到该用户名下的相关信息
        const userInfo = await ctx.service.user.getUserByName(decode.username)

        // 响应接口
        ctx.body = {
            code: 200,
            message: '获取成功',
            data: {
                id: userInfo.id,
                username: userInfo.username,
                avatar: userInfo.avatar || '',
                signature: userInfo.signature || defaultAvatar
            }
        }
    }
    // 修改用户信息
    async updateUserInfo() {
        const { ctx } = this;
        // 通过 app.jwt.verify + 加密字符串 解析出 token 的值
        const decode = ctx.decode;
        const { signature="", avatar="" } = ctx.request.body;
        try {
            // 通过 getUserByName 方法，以用户名 decode.username 为参数，从数据库获取到该用户名下的相关信息
            const userInfo = await ctx.service.user.getUserByName(decode.username)
            // 修改用户信息
            const result = await ctx.service.user.updateUserInfo({
                ...userInfo,
                signature,
                avatar
            });
            ctx.body = {
                code: 200,
                msg: '修改成功',
                data: {
                    id: userInfo.id,
                    username: userInfo.username,
                    signature,
                    avatar
                }
            };
        } catch (e) {
            console.log('error',e)
            ctx.body = {
                code: 500,
                msg: '修改失败',
                data: null
            };
        }
    }
    // 修改用户密码
    async modifyPass () {
        const { ctx, app } = this;
        const { old_pass = '', new_pass = '', new_pass2 = '' } = ctx.request.body

        try {
            let user_id
            const decode = ctx.decode
            if (!decode) return
            if (decode.username == 'admin') {
                ctx.body = {
                    code: 400,
                    msg: '管理员账户，不允许修改密码！',
                    data: null
                }
                return
            }
            user_id = decode.id
            const userInfo = await ctx.service.user.getUserByName(decode.username)

            if (old_pass != userInfo.password) {
                ctx.body = {
                    code: 400,
                    msg: '原密码错误',
                    data: null
                }
                return
            }

            if (new_pass != new_pass2) {
                ctx.body = {
                    code: 400,
                    msg: '新密码不一致',
                    data: null
                }
                return
            }

            const result = await ctx.service.user.modifyPass({
                ...userInfo,
                password: new_pass,
            })

            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: null
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    // 验证方法
    test() {
        const { ctx, app } = this;
        // 通过 token 解析，拿到 user_id
        const token = ctx.request.header.authorization; // 请求头获取 authorization 属性，值为 token
        // 通过 app.jwt.verify + 加密字符串 解析出 token 的值
        const decode = ctx.decode;
        // 响应接口
        ctx.body = {
            code: 200,
            message: '获取成功',
            data: {
                ...decode
            }
        }
    }

}

module.exports = UserController;
