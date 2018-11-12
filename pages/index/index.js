//index.js
//获取应用实例
const app = getApp()
import { _debounce, _throttle, _translate } from '../../utils/api.js'

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
        loadingText: '正在翻译...',
        historyList: [],
        langList: []
    },
    onLoad: function(){
        let history = wx.getStorageSync('history') || []
        this.setData({ historyList: history, langList:  app.globalData.langList})
    },
    onShow: function(){
        this.setData(
            {
                fromLang: app.globalData.fromLang,
                toLang: app.globalData.toLang
            }
        )
        if (this.data.queryText.trim()) {
            this.onConfirm()
        }
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease-out',
        })
        this.animation = animation
    },
    onConfirm: _debounce(function() {
        if (this.data.queryText.trim().length > 0){
            _translate(this.data.queryText, { from: this.data.fromLang.code, to: this.data.toLang.code })
                .then(res => {
                    this.data.langList.forEach((item)=>{
                        if (res.to === item.code) res.to = item
                        if (res.from === item.code) res.from = item
                    })
                    this.setData({ 'transResult': res.trans_result, translating: false, complete: true })
                    if (this.data.fromLang.code === 'auto') {
                        let autoName = '检测到' + res.from.name;
                        this.setData({ fromLang: { name: autoName , code: 'auto'}})
                    }
                    // 存储历史
                    let history = wx.getStorageSync('history') || []
                    history.forEach((item,index)=>{
                        if (JSON.stringify(item) === JSON.stringify(res)){
                            history.splice(index,1)
                        }
                    })
                    history.unshift(res)
                    // 最多存储20条
                    history.length = history.length > 20 ? 20 : history.length
                    this.setData({ historyList: history })
                    wx.setStorageSync('history', history)
                }, () => {
                    this.setData({ translating: false, complete: false })
                })
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
            this.setData({ queryText: '', translating: false, complete: false})
        }
    },
    clearQuery: function(){
        this.setData({ queryText: "", translating: false, complete: false})
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
            dataSrc += item.src;
            dataDst += item.dst
        })
        this.setData({
            fromLang: dataset.data.from,
            toLang: dataset.data.to,
            queryText: dataSrc,
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
            success(res){
                wx.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 3000
                })
            },
            fail(res){
                wx.showToast({
                    title: '复制失败',
                    icon: 'none',
                    duration: 3000
                })
            }
        })
    },
    playResPron(){
        wx.showToast({
            title: '此功能暂不支持',
            icon: 'none',
            duration: 3000
        })
    }
})
