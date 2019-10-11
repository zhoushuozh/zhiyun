//app.js
App({
  onLaunch: function () {
      this.globalData.fromLang = wx.getStorageSync("fromLang") || this.globalData[`${this.globalData.api}_langList`][0]
      this.globalData.toLang = wx.getStorageSync("toLang") || this.globalData[`${this.globalData.api}_langList`][1]
  },
  globalData: {
    fromLang: {},
    toLang: {},
    // y == 有道, b == 百度
    api: 'y',
    b_langList: [
        {
            "code":"auto",
            "name":"自动检测"
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