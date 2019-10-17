// pages/favorites/favorites.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName: '',
    avatarSrc: '',
    totalRow: '',
    page: 1,
    row: 30,
    loadingType: 0, // 加载状态 0: 未加载，1：正在加载或所有数据加载完成
    favoriteList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.getAuthUserInfo()
    this.getData()
    wx.getUserInfo({
      success: res => {
        this.setData({
          avatarSrc: res.userInfo.avatarUrl,
          userName: res.userInfo.nickName
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 获取数据
  getData(refresh) {
    this.setData({loadingType: 1})
    wx.showLoading({ title: '加载中', mask: true })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getData',
      // 传给云函数的参数
      data: {
        page: this.data.page,
        row: this.data.row,
        type: 'favorite'
      }
    })
      .then(res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if (res.result.data) {
          if (refresh) this.setData({ favoriteList: [] })
          this.setData({
            totalRow: res.result.totalRow,
            totalPage: res.result.totalPage,
            favoriteList: this.data.favoriteList.concat(res.result.data)
          })
          this.setData({ loadingType: +(this.data.page >= res.result.totalPage)})
        } else {
          wx.showToast({
            title: '获取收藏失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.log(err)
        wx.showToast({
          title: '未知错误',
          icon: 'none'
        })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
  },
  unStar(event) {
    let itemData = event.currentTarget.dataset.data
    let itemID = itemData._id
    app.$collect_historys.doc(itemID).update({
      data: {
        star: false,
        starUpdateTime: app.$db.serverDate()
      }
    })
      .then(res => {
        if (res.stats.updated) {
          let list = this.data.favoriteList.filter(item => item._id !== itemID)
          this.setData({
            favoriteList: list
          })
        } else {
          wx.showToast({
            title: '网络错误, 请稍后重试',
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
  onClickItem(event) {
    let itemData = event.currentTarget.dataset.data
    let query = {
      lang: itemData.lang,
      queryText: itemData.queryText,
      transResult: itemData.transResult,
      complete: true
    }
    wx.navigateTo({
      url: `/pages/translate/translate?data=${JSON.stringify(query)}`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1
    })
    this.getData('refresh')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 如果正在加载或所有数据加载完成，则不做操作
    if (this.data.loadingType) {
      return;
    } else {
      this.setData({page: this.data.page + 1})
      this.getData();
    }
  }
})