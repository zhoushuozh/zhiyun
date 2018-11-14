//index.js
//获取应用实例
const app = getApp()
import {
    _debounce,
    _throttle,
    b_translate,
    y_translate
} from '../../utils/api.js'

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
        srcAudioPlay: false,
        dstAudioPlay: false,
        ukAudioPlay: false,
        usAudioPlay: false,
        langList: []
    },
    onLoad: function(){
        let history = wx.getStorageSync('history') || []
        this.setData({ 
            historyList: history, 
            langList: app.globalData[`${app.globalData.api}_langList`]
        })
    },
    onShow: function(){
        this.setData(
            {
                fromLang: app.globalData.fromLang,
                toLang: app.globalData.toLang
            }
        )
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
        if (this.data.queryText.length > 0){
            if(app.globalData.api === 'b'){
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
                        history.length = history.length > 20 ? 20 : history.length
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
                        console.log(this.data.detailsResult.basic['uk-phonetic'])
                        if (this.data.fromLang.code === 'auto') {
                            let autoName = '检测到' + result.from.name;
                            this.setData({
                                fromLang: {
                                    name: autoName,
                                    code: 'auto'
                                }
                            })
                        }
                        console.log(res)
                        // return
                        // 存储历史
                        let history = wx.getStorageSync('history') || []
                        history.forEach((item, index) => {
                            if (JSON.stringify(item) === JSON.stringify(result)) {
                                history.splice(index, 1)
                            }
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
    onInput: function(event){
        let queryValue = event.detail.value.trim();
        if (queryValue.length > 0){
            if (queryValue !== this.data.queryText){
                this.setData({ queryText: queryValue, translating: true })
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
    clearQuery: function(){
        this.setData({
            queryText: "",
            detailsResult: {},
            translating: false,
            complete: false
        })
    },
    exchangeLang: _throttle(function(){
        if (this.data.fromLang.code !== 'auto'){
            var tmp = this.data.toLang;
            this.animation.translate("110%", 0).step().translate(0, 0).step();
            this.setData({ selectLangLeft: this.animation.export() })
            this.animation.translate("-110%", 0).step().translate(0, 0).step();
            this.setData({ selectLangRight: this.animation.export() })
            setTimeout(() => {
                this.setData(
                    {
                        toLang: this.data.fromLang,
                        fromLang: tmp
                    }
                )
            }, 500)
            if (this.data.queryText.trim()){
                this.onConfirm()
            }
        }
    }, 1000),
    clickHistoryItem(event){
        let dataset = event.currentTarget.dataset;
        let dataSrc = '', dataDst = '';
        dataset.data.trans_result.forEach((item)=>{
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
            transResult: [{ src: dataSrc, dst: dataDst}],
            complete: true
        })
        app.globalData.toLang = dataset.data.to;
        app.globalData.fromLang = dataset.data.from;
        this.onConfirm()
    },
    clearHistory(){
        this.setData({historyList: []});
        wx.setStorageSync("history", [])
    },
    delHistoryItem(event){
        let index = event.currentTarget.dataset.index;
        let arr = this.data.historyList;
        arr.splice(index, 1);
        this.setData({historyList: arr})
        wx.setStorageSync("history", arr)
    },
    copyResult(){
        let copyText = '';
        this.data.transResult.forEach(item => {
            copyText = item.dst
        })
        // console.log(copyText)
        wx.setClipboardData({
            data: copyText,
            success(){
                wx.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 3000
                })
            },
            fail(){
                wx.showToast({
                    title: '复制失败',
                    icon: 'none',
                    duration: 3000
                })
            }
        })
    },
    playResPron(){
        if (this.data.detailsResult.tSpeakUrl) {
            const resAudio = wx.getBackgroundAudioManager()
            if (resAudio.paused === undefined || resAudio.paused) {
                resAudio.src = this.data.detailsResult.tSpeakUrl
                resAudio.onPlay(()=>{this.setData({dstAudioPlay: true})})
                resAudio.onEnded(()=>{this.setData({dstAudioPlay: false})})
                resAudio.onStop(()=>{this.setData({dstAudioPlay: false})})
                resAudio.onPause(()=>{this.setData({dstAudioPlay: false})})
            } else {
                resAudio.stop()
            }
        } else {
            wx.showToast({
                title: '暂无发音',
                icon: 'none',
                duration: 2000
            })
        }
    },
    playSrcPron() {
        if (this.data.detailsResult.speakUrl) {
            const srcAudio = wx.getBackgroundAudioManager()
            if (srcAudio.paused === undefined || srcAudio.paused) {
                srcAudio.src = this.data.detailsResult.speakUrl
                srcAudio.onPlay(() => {this.setData({srcAudioPlay: true})})
                srcAudio.onEnded(() => {this.setData({srcAudioPlay: false})})
                srcAudio.onStop(() => {this.setData({srcAudioPlay: false})})
                srcAudio.onPause(() => {this.setData({srcAudioPlay: false})})
            } else {
                srcAudio.stop()
            }
        } else {
            wx.showToast({
                title: '暂无发音',
                icon: 'none',
                duration: 2000
            })
        }
    },
    playUsPron() {
        if (this.data.detailsResult.basic['us-speech']) {
            const usAudio = wx.getBackgroundAudioManager()
            if (usAudio.paused === undefined || usAudio.paused) {
                usAudio.src = this.data.detailsResult.basic['us-speech']
                usAudio.onPlay(() => {this.setData({usAudioPlay: true})})
                usAudio.onEnded(() => {this.setData({usAudioPlay: false})})
                usAudio.onStop(() => {this.setData({usAudioPlay: false})})
                usAudio.onPause(() => {this.setData({usAudioPlay: false})})
            } else {
                usAudio.stop()
            }
        } else {
            wx.showToast({
                title: '暂无发音',
                icon: 'none',
                duration: 2000
            })
        }
    },
    playUkPron() {
        if (this.data.detailsResult.basic['uk-speech']) {
            const ukAudio = wx.getBackgroundAudioManager()
            if (ukAudio.paused === undefined || ukAudio.paused) {
                ukAudio.src = this.data.detailsResult.basic['uk-speech']
                ukAudio.onPlay(() => {this.setData({ukAudioPlay: true})})
                ukAudio.onEnded(() => {this.setData({ukAudioPlay: false})})
                ukAudio.onStop(() => {this.setData({ ukAudioPlay: false})})
                ukAudio.onPause(() => {this.setData({ukAudioPlay: false})})
            } else {
                ukAudio.stop()
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
