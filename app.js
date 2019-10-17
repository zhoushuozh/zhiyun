//app.js
App({
  onLaunch: function() {
    this.checkSession()
    this.getAuthUserInfo()
    this.globalData.fromLang = wx.getStorageSync("fromLang") || this.globalData[`${this.globalData.api}_langList`][0]
    this.globalData.toLang = wx.getStorageSync("toLang") || this.globalData[`${this.globalData.api}_langList`][1]

    wx.cloud.init({
      env: 'test-pka9m'
    })
    this.$db = wx.cloud.database()
    this.$collect_historys = this.$db.collection('historys')
  },
  // 验证是否登录
  checkSession() {
    wx.checkSession({
      success() {
        console.log('session_key 未过期')
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        console.log('session_key 已经失效')
        wx.login({
          success: function (res) {
            console.log(res)
          }
        }) //重新登录
      }
    })
  },
  // 验证是否授权获取用户信息
  getAuthUserInfo() {
    wx.getSetting({
      success: (res) => {
        this.globalData.authUserInfo = res.authSetting['scope.userInfo']
        if (!res.authSetting['scope.userInfo']) {
          wx.redirectTo({
            url: '/pages/get-auth/get-auth'
          })
        }
      },
      fail(err) {
        this.globalData.authUserInfo = false
        wx.showToast({
          title: '网络错误, 请稍后重试',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  globalData: {
    fromLang: {},
    toLang: {},
    // y == 有道, b == 百度
    api: 'y',
    b_langList: [{
        "code": "auto",
        "name": "自动检测"
      },
      {
        "code": "zh",
        "name": "中文"
      },
      {
        "code": "en",
        "name": "英文"
      },
      {
        "code": "cht",
        "name": "繁体中文"
      },
      {
        "code": "yue",
        "name": "粤语"
      },
      {
        "code": "wyw",
        "name": "文言文"
      },
      {
        "code": "jp",
        "name": "日语"
      },
      {
        "code": "kor",
        "name": "韩语"
      },
      {
        "code": "fra",
        "name": "法语"
      },
      {
        "code": "spa",
        "name": "西班牙语"
      },
      {
        "code": "vie",
        "name": "越南语"
      },
      {
        "code": "th",
        "name": "泰语"
      },
      {
        "code": "ara",
        "name": "阿拉伯语"
      },
      {
        "code": "ru",
        "name": "俄语"
      },
      {
        "code": "pt",
        "name": "葡萄牙语"
      },
      {
        "code": "de",
        "name": "德语"
      },
      {
        "code": "it",
        "name": "意大利语"
      },
      {
        "code": "el",
        "name": "希腊语"
      },
      {
        "code": "nl",
        "name": "荷兰语"
      }
    ],
    y_langList: [{
        "code": "auto",
        "name": "自动检测"
      },
      {
        "code": "zh-CHS",
        "name": "中文"
      },
      {
        "code": "en",
        "name": "英文"
      },
      {
        "code": "ja",
        "name": "日文"
      },
      {
        "code": "ko",
        "name": "韩文"
      },
      {
        "code": "ru",
        "name": "法文"
      },
      {
        "code": "fr",
        "name": "俄文"
      },
      {
        "code": "pt",
        "name": "葡萄牙文"
      },
      {
        "code": "es",
        "name": "西班牙文"
      },
      {
        "code": "vi",
        "name": "越南文"
      },
      {
        "code": "de",
        "name": "德文"
      },
      {
        "code": "ar",
        "name": "阿拉伯文"
      },
      {
        "code": "id",
        "name": "印尼文"
      }
    ]
  }
})