//translate.js
//获取应用实例
const app = getApp()
import {
  _debounce,
  _throttle,
  b_translate,
  y_translate
} from '../../utils/api.js'
import md5 from '../../utils/md5.min.js'

Page({
  data: {
    isFocus: true,
    isQuery: false,
    queryText: "",
    translating: false,
    complete: false,
    fromLang: {},
    toLang: {},
    selectLangLeft: {},
    selectLangRight: {},
    transResult: {},
    detailsResult: {},
    loadingText: '正在翻译...',
    langList: [],
    playingUrl: '',
    audioState: {
      speakUrl: false,
      tSpeakUrl: false,
      'us-speech': false,
      'uk-speech': false
    },
    isStar: false,
    currentId: '',
    slideButtons: [
      { src: '../../assets/svg/icon-collection.svg' },
      { src: '../../assets/svg/icon-delet.svg' }
    ]
  },
  onLoad: function (query) {
    let data = query.data ? JSON.parse(query.data) : {}
    let langList = app.globalData[`${app.globalData.api}_langList`]

    data.from = data.lang.split('2')[0]
    data.to = data.lang.split('2')[1]
    delete data.lang

    langList.forEach((item) => {
      if (data.to === item.code) data.to = item
      if (data.from === item.code) data.from = item
    })

    app.globalData.toLang = data.to;
    app.globalData.fromLang = data.from;
    
    this.setData({
      ...data,
      isFocus: !query.data,
      langList: app.globalData[`${app.globalData.api}_langList`]
    })
  },
  onShow: function () {
    this.setData({
      fromLang: app.globalData.fromLang,
      toLang: app.globalData.toLang
    })
    if (this.data.queryText) {
      this.onConfirm()
    }
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
    })
    this.animation = animation
  },
  onConfirm: _debounce(function () {
    if (this.data.queryText.length > 0) {
      if (app.globalData.api === 'b') {
        b_translate(this.data.queryText, {
          from: this.data.fromLang.code,
          to: this.data.toLang.code
        })
          .then(res => {
            let result = {}
            result.lang = res.from + '2' + res.to
            result.queryText = ''
            result.transResult = ''
            res.trans_result.forEach(item => {
              result.queryText += item.src
              result.transResult += item.dst
            })
            this.setData({
              'transResult': res.trans_result,
              translating: false,
              complete: true
            })
            if (this.data.fromLang.code === 'auto') {
              this.setAutoLangName(result.lang)
            }
            // 存储历史
            this.saveHistory(result)
          }, () => {
            this.setData({
              translating: false,
              complete: false
            })
          })
      } else if (app.globalData.api === 'y') {
        y_translate(this.data.queryText, {
          from: this.data.fromLang.code,
          to: this.data.toLang.code
        })
          .then(res => {
            let result = {}
            result.lang = res.l
            result.queryText = res.query
            result.transResult = ''
            res.translation.forEach(word => {
              result.transResult += word
            })

            this.setData({
              transResult: result.transResult,
              detailsResult: {
                basic: res.basic || '',
                web: res.web || '',
                tSpeakUrl: res.tSpeakUrl,
                speakUrl: res.speakUrl
              },
              translating: false,
              complete: true
            })
            if (this.data.fromLang.code === 'auto') {
              this.setAutoLangName(result.lang)
            }
            // return
            // 存储历史
            this.saveHistory(result)
          }, () => {
            this.setData({
              translating: false,
              complete: false
            })
          })
      }
    }
  }, 1000),
  // 设置自动检测语言
  setAutoLangName(lang) {
    let fromLangCode = lang.split('2')[0], autoName
    this.data.langList.forEach(item => {
      if (fromLangCode === item.code) autoName = '检测到' + item.name;
    })
    this.setData({
      fromLang: {
        name: autoName,
        code: 'auto'
      }
    })
  },
  // 保存历史记录
  saveHistory(historyItem) {
    let md5Val = md5(historyItem.queryText + historyItem.lang)
    historyItem.md5Val = md5Val

    wx.cloud.callFunction({
      // 云函数名称
      name: 'saveRecord',
      // 传给云函数的参数
      data: {
        ...historyItem,
        date: app.$db.serverDate()
      }
    }).then(res => {
      console.log(res)
      if (res.result) {
        this.setData({
          isStar: res.result.star,
          currentId: res.result._id
        })
      }
    }).catch(err => {
      console.log(err)
    })
    // 本地历史记录保存
    // let history = wx.getStorageSync('history') || []
    // history.forEach((item, index) => {
    //   if (item.md5Val === md5Val) {
    //     history.splice(index, 1)
    //   }
    // })
    // history.unshift(historyItem)
    // 最多存储30条
    // history.length = history.length > 30 ? 30 : history.length
    // wx.setStorageSync('history', history)
  },
  onInput: function (event) {
    let queryValue = event.detail.value.trim();
    if (queryValue.length > 0) {
      if (queryValue !== this.data.queryText) {
        this.setData({
          queryText: queryValue,
          translating: true,
          isStar: false,
          currentId: ''
        })
        this.onConfirm()
      }
    } else {
      this.setData({
        queryText: '',
        detailsResult: {},
        translating: false,
        complete: false
      })
    }
  },
  onClearQuery: function () {
    this.setData({
      queryText: "",
      detailsResult: {},
      translating: false,
      complete: false
    })
  },
  exchangeLang: _throttle(function () {
    if (this.data.fromLang.code !== 'auto') {
      var tmp = this.data.toLang;
      this.animation.translate("110%", 0).step().translate(0, 0).step();
      this.setData({
        selectLangLeft: this.animation.export()
      })
      this.animation.translate("-110%", 0).step().translate(0, 0).step();
      this.setData({
        selectLangRight: this.animation.export()
      })
      setTimeout(() => {
        this.setData({
          toLang: this.data.fromLang,
          fromLang: tmp
        })
      }, 500)
      if (this.data.queryText.trim()) {
        this.onConfirm()
      }
    }
  }, 1000),
  onCopyResult() {
    wx.setClipboardData({
      data: this.data.transResult,
      success() {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 3000
        })
      },
      fail() {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  onStar() {
    app.$collect_historys.doc(this.data.currentId).update({
      data: {
        star: !this.isStar,
        starUpdateTime: app.$db.serverDate()
      }
    }).then(res => {
      console.log(res)
      if (res.stats && res.stats.update) {
        this.setData({
          isStar: true
        })
      }
    })
  },
  slideButtonTap(e) {
    console.log(e.detail.index)
    if (e.detail.index === 0) {
      this.onCollection(e.detail.data.id)
    } else if (e.detail.index === 1) {
      this.onDelHistoryItem(e.detail.data.id)
    }
  },
  clearAudioState() {
    for (let _key in this.data.audioState) {
      let _dataKey = `audioState.${_key}`
      this.setData({
        [_dataKey]: false
      })
    }
  },
  playPronunciation(event) {
    let key = event.target.dataset.audiokey
    let audioUrl = key.indexOf('speech') > -1 ? this.data.detailsResult.basic[key] : this.data.detailsResult[key]
    console.log(key, audioUrl)
    if (audioUrl) {
      const pAudio = wx.getBackgroundAudioManager()
      // 清空状态
      this.clearAudioState()

      let dataKey = `audioState.${key}`
      pAudio.onPlay(() => {
        this.setData({
          [dataKey]: true,
          playingUrl: audioUrl
        })
      })
      pAudio.onEnded(() => {
        this.clearAudioState()
      })
      pAudio.onStop(() => {
        this.clearAudioState()
      })
      pAudio.onError((res) => {
        this.clearAudioState()
        wx.showToast({
          title: `未知错误：${res.errCod} ${res.errMsg}`,
          icon: 'none',
          duration: 3000
        })
      })

      if (pAudio.paused === undefined || pAudio.paused || this.data.playingUrl !== audioUrl) {
        pAudio.stop()
        pAudio.title = key
        pAudio.src = audioUrl
        pAudio.play()
      } else {
        pAudio.stop()
      }
    } else {
      wx.showToast({
        title: '暂无发音',
        icon: 'none',
        duration: 2000
      })
    }
  }
})