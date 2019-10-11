//index.js
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
    historyList: [],
    langList: [],
    playingUrl: '',
    audioState: {
      speakUrl: false,
      tSpeakUrl: false,
      'us-speech': false,
      'uk-speech': false
    },
    slideButtons: [
      // {src: '../../assets/svg/icon-collection.svg'},
      {src: '../../assets/svg/icon-delet.svg'}
    ]
  },
  onLoad: function() {
    let history = wx.getStorageSync('history') || []
    this.setData({
      historyList: history,
      langList: app.globalData[`${app.globalData.api}_langList`]
    })
  },
  onShow: function() {
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
  onConfirm: _debounce(function() {
    if (this.data.queryText.length > 0) {
      if (app.globalData.api === 'b') {
        b_translate(this.data.queryText, {
            from: this.data.fromLang.code,
            to: this.data.toLang.code
          })
          .then(res => {
            this.data.langList.forEach((item) => {
              if (res.to === item.code) res.to = item
              if (res.from === item.code) res.from = item
            })
            this.setData({
              'transResult': res.trans_result,
              translating: false,
              complete: true
            })
            if (this.data.fromLang.code === 'auto') {
              let autoName = '检测到' + res.from.name;
              this.setData({
                fromLang: {
                  name: autoName,
                  code: 'auto'
                }
              })
            }
            // 存储历史
            let history = wx.getStorageSync('history') || []
            history.forEach((item, index) => {
              if (JSON.stringify(item) === JSON.stringify(res)) {
                history.splice(index, 1)
              }
            })
            history.unshift(res)
            // 最多存储20条
            history.length = history.length > 30 ? 30 : history.length
            this.setData({
              historyList: history
            })
            wx.setStorageSync('history', history)
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
            result.trans_result = res.translation
            result.query = res.query
            result.from = res.l.split('2')[0]
            result.to = res.l.split('2')[1]
            this.data.langList.forEach((item) => {
              if (result.to === item.code) result.to = item
              if (result.from === item.code) result.from = item
            })

            this.setData({
              transResult: res.translation,
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
              let autoName = '检测到' + result.from.name;
              this.setData({
                fromLang: {
                  name: autoName,
                  code: 'auto'
                }
              })
            }
            // return
            // 存储历史
            let history = wx.getStorageSync('history') || []
            history.forEach((item, index) => {
              if (item.id === md5(JSON.stringify(result))) {
                history.splice(index, 1)
              }
            })
            result.id = md5(JSON.stringify(result))
            result.slideButtons = this.data.slideButtons
            result.slideButtons.forEach(item => {
              item.data = { id: result.id }
            })
            history.unshift(result)
            // 最多存储30条
            history.length = history.length > 30 ? 30 : history.length
            this.setData({
              historyList: history
            })
            wx.setStorageSync('history', history)
          }, () => {
            this.setData({
              translating: false,
              complete: false
            })
          })
      }

    }
  }, 1000),
  onInput: function(event) {
    let queryValue = event.detail.value.trim();
    if (queryValue.length > 0) {
      if (queryValue !== this.data.queryText) {
        this.setData({
          queryText: queryValue,
          translating: true
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
  onClearQuery: function() {
    this.setData({
      queryText: "",
      detailsResult: {},
      translating: false,
      complete: false
    })
  },
  exchangeLang: _throttle(function() {
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
  onClickHistoryItem(event) {
    let dataset = event.currentTarget.dataset;
    let dataSrc = '',
      dataDst = '';
    dataset.data.trans_result.forEach((item) => {
      if (typeof item === 'object') {
        dataSrc += item.src;
        dataDst += item.dst
      } else {
        dataDst += item
      }
    })
    this.setData({
      fromLang: dataset.data.from,
      toLang: dataset.data.to,
      queryText: dataSrc || dataset.data.query,
      transResult: [{
        src: dataSrc,
        dst: dataDst
      }],
      complete: true
    })
    app.globalData.toLang = dataset.data.to;
    app.globalData.fromLang = dataset.data.from;
    this.onConfirm()
  },
  onClearHistory() {
    this.setData({
      historyList: []
    });
    wx.setStorageSync("history", [])
  },
  onDelHistoryItem(id) {
    console.log(this.data.historyList)
    let arr = this.data.historyList.filter(item => {
      console.log(item.id, id)
      return item.id !== id
    })
    // arr.splice(index, 1);
    console.log(arr)
    this.setData({
      historyList: arr
    })
    wx.setStorageSync("history", arr)
  },
  onCopyResult() {
    let copyText = '';
    this.data.transResult.forEach(item => {
      copyText = item.dst || item
    })
    // console.log(copyText)
    wx.setClipboardData({
      data: copyText,
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
  onCollection() {
    console.log('收藏')
  },
  slideButtonTap(e) {
    console.log(e.detail.index)
    if (e.detail.index === 0) {
      // this.onCollection(e.detail.data.id)
      this.onDelHistoryItem(e.detail.data.id)
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

      console.log(pAudio.paused)
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