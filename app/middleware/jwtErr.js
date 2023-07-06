'use strict';

module.exports = (secret) => {
    return async function jwtErr(ctx, next) {
        const token = ctx.request.header.authorization; // 若是没有 token，返回的是 null 字符串
        let decode
        if(token) {
            try {
                decode = ctx.app.jwt.verify(token, secret); // 验证token
                ctx.decode = decode
                await next();
            } catch (error) {
                console.log('error', error)
                ctx.body = {msg: error}
                if (error.name === 'JsonWebTokenError') {
                    ctx.status = 401;
                    ctx.body = {
                        code: 401,
                        msg: { msg: '无效token' },
                    };
                } else if (error.name === 'TokenExpiredError') {
                    ctx.status = 401;
                    ctx.body = {
                        code: 401,
                        msg: { msg: 'token过期' },
                    };
                }
                return;
            }
        } else {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: 'token不存在',
            };
            return;
        }
    }
}
