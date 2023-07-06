'use strict';

const moment = require('moment')

const Controller = require('egg').Controller;

class BillController extends Controller {
    // 添加账单
    async add() {
        const { ctx, app } = this;
        // 获取请求中携带的参数
        const { amount, type_id, type_name, pay_type, remark = '' } = ctx.request.body;

        // 判空处理，这里前端也可以做，但是后端也需要做一层判断。
        if (!amount || !type_id || !type_name || !pay_type) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }

        try {
            let user_id
            // 从jwt 拿到 token 获取用户信息
            const decode = ctx.decode;
            if (!decode) return
            user_id = decode.id
            // user_id 默认添加到每个账单项，作为后续获取指定用户账单的标示。
            // 可以理解为，我登录 A 账户，那么所做的操作都得加上 A 账户的 id，后续获取的时候，就过滤出 A 账户 id 的账单信息。
            const result = await ctx.service.bill.add({
                amount,
                type_id,
                type_name,
                pay_type,
                remark,
                user_id
            });
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
    /**
    * @Description: 根据账单类型 时间 查询账单列表
    * @Return: [
     *         {
     *             "id": 1,
     *             "pay_type": 1,
     *             "amount": "20.00",
     *             "date": "2023-06-27T08:48:50.000Z",
     *             "type_id": 1,
     *             "type_name": "餐饮",
     *             "remark": "备注信息"
     *         }
     *     ]
    */
    async list() {
        const { ctx, app } = this;
        // 获取请求中携带的参数 日期 YYYY-MM，分页数据 类型type_id
        const { type_id, date,pageSize = 5, pageNum = 1 } = ctx.request.query;
        try {
            let user_id
            // 获取jwt信息
            const decode = ctx.decode;
            if (!decode) return
            user_id = decode.id
            // 判空处理，这里前端也可以做，但是后端也需要做一层判断。
            if (!date || !pageNum) {
                ctx.body = {
                    code: 400,
                    msg: '参数错误',
                    data: null
                }
            }
            let {total,list} = await ctx.service.bill.list({
                type_id,
                date,
                pageSize,
                pageNum,
                user_id
            })
            let __list
            let totalExpense = 0
            let totalIncome = 0
            // 首先获取当月所有账单列表
            if (list.length > 0) {
                __list = list.map(item => {
                    item.date = moment(Number(item.date)).format('YYYY-MM-DD HH:mm:ss')
                    return item
                })
                // 累加计算支出
                totalExpense = __list.reduce((curr, item) => {
                    if (item.pay_type == 1) {
                        curr += Number(item.amount)
                        return curr
                    }
                    return curr
                }, 0)
                // 累加计算收入
                totalIncome = __list.reduce((curr, item) => {
                    if (item.pay_type == 2) {
                        curr += Number(item.amount)
                        return curr
                    }
                    return curr
                }, 0)
                // 格式化按每天分组的结果
                const groupedData = {};
                __list.forEach((item) => {
                    const dateKey = moment(new Date(item.date)).format('YYYY-MM-DD');
                    if (!groupedData[dateKey]) {
                        groupedData[dateKey] = [];
                    }
                    groupedData[dateKey].push(item);
                });
                // 分页处理
                const offset = (pageNum - 1) * pageSize;
                __list = Object.entries(groupedData)
                    .slice(offset, offset + pageSize)
                    .reduce((acc, [dateKey, bills]) => {
                        acc.push({
                            date: dateKey,
                            bills,
                        });
                        return acc;
                    }, []);
            }
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    totalExpense, // 当月支出
                    totalIncome, // 当月收入
                    totalPage: Math.ceil(total / pageSize), // 总分页
                    list: __list || [] // 格式化后，并且经过分页处理的数据
                }
            }
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    /**
    * @Description: 获取账单详情
    * @Params: {string} id - 账单id
    * @Return: {${returnType}} ${returnDescription}
    */
    async detail() {
        const { ctx, app } = this;
        // 获取请求中携带的参数
        const { id = '' } = ctx.request.query;
        // 获取用户 user_id
        let user_id
        // 获取当前用户信息
        const decode = ctx.decode;
        if (!decode) return
        user_id = decode.id
        // 判断是否传入账单 id
        if (!id) {
            ctx.body = {
                code: 500,
                msg: '订单id不能为空',
                data: null
            }
            return
        }
        try {
            // 从数据库中获取账单详情
            const result = await ctx.service.bill.detail(id,user_id);
            if (result.date) {
                result.date = moment(Number(result.date)).format('YYYY-MM-DD HH:mm:ss')
            }
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: result
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    /**
    * @Description: 编辑账单
    */
    // 编辑账单
    async update() {
        const { ctx, app } = this;
        // 账单的相关参数，这里注意要把账单的 id 也传进来
        const { id, amount, type_id, type_name, date = new Date(), pay_type, remark = '' } = ctx.request.body;
        // 判空处理
        if (!amount || !type_id || !type_name || !pay_type) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }

        try {
            let user_id
            const decode = ctx.decode;
            if (!decode) return
            user_id = decode.id
            // 根据账单 id 和 user_id，修改账单数据
            const result = await ctx.service.bill.update({
                id, // 账单 id
                amount, // 金额
                type_id, // 消费类型 id
                type_name, // 消费类型名称
                date, // 日期
                pay_type, // 消费类型
                remark, // 备注
                user_id // 用户 id
            });
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
    /**
    * @Description: 删除账单
    * @Params: {string} id - 账单id
    */
    async delete() {
        const { ctx, app } = this;
        // 获取请求中携带的参数
        const { id = '' } = ctx.request.body;
        // 获取用户 user_id
        let user_id
        // 获取当前用户信息
        const decode = ctx.decode;
        if (!decode) return
        user_id = decode.id
        // 判断是否传入账单 id
        if (!id) {
            ctx.body = {
                code: 400,
                msg: '账单id不能为空',
                data: null
            }
            return
        }
        try {
            const result = await ctx.service.bill.delete(id,user_id);
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: null
            }
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    /**
    * @Description: 统计账单数据
    */
    async data() {
        const { ctx, app } = this;
        // 获取请求中携带的参数 日期 YYYY-MM，分页数据 类型type_id
        const { date } = ctx.request.query;
        try {
            let user_id
            // 获取jwt信息
            const decode = ctx.decode;
            if (!decode) return
            user_id = decode.id
            // 判空处理，这里前端也可以做，但是后端也需要做一层判断。
            if (!date) {
                ctx.body = {
                    code: 400,
                    msg: '参数错误',
                    data: null
                }
            }
            let {total,list} = await ctx.service.bill.list({
                date,
                user_id
            })
            let totalExpense = 0;
            let totalIncome = 0;
            let total_data = [];

            if (list.length > 0) {
                list.forEach(item => {
                    const { pay_type, amount, type_id, type_name } = item;
                    const number = Number(amount);

                    if (pay_type === 1) { // 累计计算支出
                        totalExpense += number;
                    } else if (pay_type === 2) { // 累计计算收入
                        totalIncome += number;
                    }
                    // 获取收支构成
                    const existingItemIndex = total_data.findIndex(dataItem => dataItem.type_id === type_id);

                    if (existingItemIndex > -1) {
                        total_data[existingItemIndex].number += number;
                    } else {
                        total_data.push({
                            type_id,
                            type_name,
                            pay_type,
                            number
                        });
                    }
                });

                total_data = total_data.map(item => ({
                    ...item,
                    number: Number(item.number.toFixed(2))
                }));
            }

            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    totalExpense, // 当月支出
                    totalIncome, // 当月收入
                    list: total_data || []
                }
            }
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }

}

module.exports = BillController;
