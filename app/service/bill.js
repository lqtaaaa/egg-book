'use strict';

const Service = require('egg').Service;

class BillService extends Service {
    async add(params) {
        const {ctx, app} = this;
        try {
            // 往 bill 表中，插入一条账单数据
            const result = await app.mysql.insert('bill', params);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // 查询列表
    async list(data) {
        const {ctx, app} = this;
        const {date, pageNum, pageSize, type_id, user_id} = data;
        const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark';
        let query = `SELECT ${QUERY_STR} FROM bill WHERE user_id = ${user_id}`;
        // let countQuery = 'SELECT COUNT(*) AS total FROM (SELECT DISTINCT DATE(date) AS group_date FROM bill) AS temp';
        let countQuery = 'SELECT COUNT(*) AS total FROM bill';
        let params = [];
        try {
            if (date) {
                const [year, month] = date.split('-');
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 0);
                const startDateString = start.toISOString().split('T')[0];
                const endDateString = end.toISOString().split('T')[0];

                const startDate = `${startDateString} 00:00:00`;
                const endDate = `${endDateString} 23:59:59`;
                query += ' AND date >= ? AND date <= ?';
                // countQuery += ' WHERE group_date >= ? AND group_date <= ?';
                countQuery += ' WHERE date >= ? AND date <= ?';
                params.push(startDate, endDate);
            }
            if (type_id && type_id !== "all") {
                query += ' AND type_id = ?';
                countQuery += ' AND type_id = ?';
                params.push(type_id);
            }
            // 执行查询获取总数
            const countResult = await app.mysql.query(countQuery, params);
            const total = countResult[0].total;
            // 按时间倒序排序
            query += ' ORDER BY date DESC';
            // 执行查询
            const result = await app.mysql.query(query, params);



            return {
                list: result,
                total,
            };
        } catch (error) {
            console.log(error);
            return
        }
    }
    /**
    * @Description: 查询指定用户 指定账单详情
    * @Params: {string} id - 账单id
    * @Params: {string} user_id - 用户Id
    */
    async detail(id, user_id) {
        const {ctx, app} = this;
        try {
            const result = await app.mysql.get('bill', {id, user_id});
            return result;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    /**
    * @Description: 更新账单
    */
    async update(params) {
        const { ctx, app } = this;
        try {
            let result = await app.mysql.update('bill', {
                ...params
            }, {
                id: params.id,
                user_id: params.user_id
            });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    /**
    * @Description: 删除账单
    * @Params: {string} id
    * @Return: {string} user_id
    */
    async delete(id,user_id) {
        const { ctx, app } = this;
        try {
            let result = await app.mysql.delete('bill', {
                id,
                user_id
            });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

}

module.exports = BillService;
