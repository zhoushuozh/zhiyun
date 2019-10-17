//index.js
//获取应用实例
const app = getApp()

import {
  _throttle,
} from '../../utils/api.js'

Page({
  data: {
    selectLangLeft: {},
    selectLangRight: {},
    historyList: [],
    langList: [],
    starBtnSrc: '../../assets/svg/icon-collection.svg',
    staredBtnSrc: '../../assets/svg/icon-collected.svg',
    slideButtons: [
      {
        src: '../../assets/svg/icon-collection.svg',
        data: ''
      },
      {
        src: '../../assets/svg/icon-delet.svg',
        data: ''
      }
    ]
  },
  onLoad: function() {
    this.setData({
      langList: app.globalData[`${app.globalData.api}_langList`]
    })
    app.getAuthUserInfo()
  },
  onShow: function() {
    // let history = wx.getStorageSync('history') || []
    this.getHistory()
    this.setData({
      fromLang: app.globalData.fromLang,
      toLang: app.globalData.toLang,
      // historyList: history
    })
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
    })
    this.animation = animation
  },
  getHistory() {
    // if (!app.globalData.authUserInfo) return
    // wx.showLoading({ title: '加载中', mask: true })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getData',
      // 传给云函数的参数
      data: {
        type: 'history'
      }
    })
      .then(res => {
        let dataStr
        let resData = res.result.data.map(item => {
          dataStr = JSON.stringify(item)
          item.slideButtons = JSON.parse(JSON.stringify(this.data.slideButtons))
          item.slideButtons[0].src = item.star ? this.data.staredBtnSrc : this.data.starBtnSrc
          item.slideButtons.forEach(btn => {
            btn.data = dataStr
          })
          return item
        })
        this.setData({
          historyList: resData
        })
        wx.stopPullDownRefresh()
        // wx.hideLoading()
      })
      .catch(err => {
        console.log(err)
        // wx.hideLoading()
      })
  },
  onClickInput() {
    this.toTranslate()
  },
  toTranslate(data) {
    let query = data ? `data=${JSON.stringify(data)}` : ''
    wx.navigateTo({
      url: `/pages/translate/translate?${query}`
    })
  },
  exchangeLang: _throttle(function() {
    if (this.data.fromLang.code !== 'auto') {
      this.animation.translate("110%", 0).step().translate(0, 0).step();
      this.setData({
        selectLangLeft: this.animation.export()
      })
      this.animation.translate("-110%", 0).step().translate(0, 0).step();
      this.setData({
        selectLangRight: this.animation.export()
      })
      setTimeout(() => {
        var tmp = this.data.toLang;
        app.globalData.fromLang = tmp
        app.globalData.toLang = this.data.fromLang
        this.setData({
          toLang: this.data.fromLang,
          fromLang: tmp
        })
      }, 500)
    }
  }, 1000),
  // 点击历史记录
  onClickHistoryItem(event) {
    let data = event.currentTarget.dataset.data;
    this.toTranslate({
      lang: data.lang,
      queryText: data.queryText,
      transResult: data.transResult,
      complete: true
    })
  },
  onClearHistory() {
    this.setData({
      historyList: []
    });
    wx.setStorageSync("history", [])
  },
  // 删除历史记录
  onDelHistoryItem(data) {
    let itemData = JSON.parse(data)
    let itemID = itemData._id
    app.$collect_historys.doc(itemID).update({
      data: {
        visible: false
      }
    }).then(res => {
      // console.log(res)
      // this.getHistory()
      if (res.stats.updated) {
        let list = this.data.historyList.filter(item => item._id !== itemID)
        this.setData({
          historyList: list
        })
      } else {
        wx.showToast({
          title: '删除失败, 请稍后重试',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: '未知错误',
        icon: 'none'
      })
      console.log(err)
    })
  },
  // 收藏
  onClickStar(data) {
    let itemData = JSON.parse(data)
    let itemId = itemData._id
    app.$collect_historys.doc(itemId).update({
      data: {
        star: !itemData.star,
        starUpdateTime: app.$db.serverDate()
      }
    }).then(res => {
      if (res.stats.updated) {
        this.data.historyList.forEach((item, index) => {
          if (item._id === itemId) {
            let srcKey = `historyList[${index}].slideButtons[0].src`
            this.setData({
              [srcKey]: itemData.star ? this.data.starBtnSrc : this.data.staredBtnSrc
            })
            return
          }
        })
      } else {
        wx.showToast({
          title: '删除失败, 请稍后重试',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: '未知错误',
        icon: 'none'
      })
      console.log(err)
    })
  },
  slideButtonTap(e) {
    if (e.detail.index === 0) {
      this.onClickStar(e.detail.data)
    } else if (e.detail.index === 1) {
      this.onDelHistoryItem(e.detail.data)
    }
  },
  // 更新历史记录按钮状态
  updateStarState(index, type, id) {
    console.log(index, type, id)
    let iconSrc = type ? this.data.starActiveSrc : this.data.starSrc
    let starKey = `historyList[${index}].isStar`
    let idKey = `historyList[${index}].id`
    let srcKey = `historyList[${index}].slideButtons[0].src`
    this.setData({
      [idKey]: id,
      [starKey]: !!type,
      [srcKey]: iconSrc
    })
    wx.setStorageSync("history", this.data.historyList)
  },
  onPullDownRefresh: function () {
    this.getHistory()
  },
})