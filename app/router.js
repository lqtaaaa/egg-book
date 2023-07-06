'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller,middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret)
  router.get('/', controller.home.index);
  router.post('/api/user/register', controller.user.register);
  router.post('/api/user/login', controller.user.login);
  router.get('/api/user/getUserInfo', _jwt, controller.user.getUserInfo); // 获取用户信息
  router.post('/api/user/updateUserInfo', _jwt, controller.user.updateUserInfo); // 修改用户个性签名
  router.post('/api/user/modify_pass', _jwt, controller.user.modifyPass); // 修改用户密码
  router.post('/api/upload', controller.upload.upload); // 上传图片
  router.post('/api/bill/add', _jwt, controller.bill.add); // 添加账单
  router.get('/api/bill/list', _jwt, controller.bill.list); // 查询账单列表
  router.get('/api/bill/detail', _jwt, controller.bill.detail); // 获取详情
  router.post('/api/bill/update', _jwt, controller.bill.update); // 修改账单
  router.post('/api/bill/delete', _jwt, controller.bill.delete); // 删除账单
  router.get('/api/bill/data', _jwt, controller.bill.data); // 查询账单统计数据
  router.get('/api/type/list', _jwt, controller.type.list); // 获取消费类型列表

  router.get('/api/user/test', _jwt,controller.user.test);

};
