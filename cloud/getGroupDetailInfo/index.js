const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
exports.main = async (event, context) => {
  let {groupid} = event
  // collection 上的 get 方法会返回一个 Promise，因此云函数会在数据库异步取完数据后返回结果
  return db.collection('Group').aggregate().match({
    _id: groupid
  }).lookup({
    from: 'User',
    localField: '_id',
    foreignField: 'belong',
    as: 'userList',
    }).lookup({
      from: 'Task',
      localField: '_id',
      foreignField: 'groupid',
      as: 'taskList',
    }).end()
}