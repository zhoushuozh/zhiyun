// pages/get-auth/get-auth.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    authUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindGetUserInfo(e) {
    if (e.detail.userInfo){
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },
})