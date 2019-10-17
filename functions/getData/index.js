// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let reqData = {
    page: event.page || 1,
    row: event.row || 30,
    type: event.type || 'history'
  }
  console.log(reqData)

  let isStar = {}, orderBy = 'updateTime'
  if (reqData.type === 'favorite') {
    isStar = {star: true}
    orderBy = 'starUpdateTime'
  }
  let totalRes = await db.collection('historys').where({
    _openid: wxContext.OPENID,
    visible: true,
    ...isStar
  }).count()

  let skipNum = (reqData.page - 1) * reqData.row
  let dataRes = await db.collection('historys').where({
    _openid: wxContext.OPENID,
    visible: true,
    ...isStar
  }).orderBy(orderBy, 'desc').skip(skipNum).limit(reqData.row).get()

  console.log({
    data: dataRes.data,
    total: totalRes.total
  })

  return {
    data: dataRes.data,
    totalRow: totalRes.total,
    totalPage: Math.ceil(totalRes.total / reqData.row)
  }
}