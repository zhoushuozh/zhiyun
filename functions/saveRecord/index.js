// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let result = {}
  let reqData = {
    lang: '',
    queryText: '',
    transResult: '',
    md5Val: ''
  }
  for(let key in reqData) {
    reqData[key] = event[key]
  }
  const checkRes = await db.collection('historys').where({
    _openid: wxContext.OPENID,
    md5Val: event.md5Val
  }).get()

  if (checkRes.data && checkRes.data[0]) {
    result = await db.collection('historys').doc(checkRes.data[0]._id).update({
      data: {
        updateTime: event.date,
        visible: true
      }
    })
    result.star = checkRes.data[0].star
    result._id = checkRes.data[0]._id
  } else {
    // let userInfo = Object.assign({}, event.userInfo)
    result = await db.collection('historys').add({
      data: {
        ...reqData,
        _openid: wxContext.OPENID,
        _appid: wxContext.APPID,
        createTime: event.date,
        updateTime: event.date,
        star: false,
        visible: true
      }
    })
  }

  return result
}