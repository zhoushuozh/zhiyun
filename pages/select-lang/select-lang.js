// pages/select-lang/select-lang.js
const util = require('../../utils/util.js')
const app = getApp()
Page({
    data: {
        title: '选择语言',
        origin: '',
        opposeLang: {},
        curLang: {},
        langList: app.globalData.langList,
    },

    onTapItem: function(event){
        let actLang =  event.currentTarget.dataset
        // 如果点击的目标语言和源语言相同，则不响应
        if (actLang.code === this.data.opposeLang.code && this.data.origin === 'to' ){
            console.log(1)
           return
        } else if (actLang.code === this.data.opposeLang.code && this.data.origin === 'from') {
            console.log(2)
            // 如果点击的语言和目标语言相同，则将目标语言设置成其他语言
            // 如果目标语言是中文，则设置成英文，如果是其他语言，则设置成英文
            if (this.data.opposeLang.code === 'en'){
                wx.setStorageSync('toLang', {"code": "zh", "name": "中文" })
                app.globalData.toLang = {"code": "zh", "name": "中文" }
            } else {
                wx.setStorageSync('toLang', { "name": "英语", "code": "en" })
                app.globalData.toLang = { "name": "英语", "code": "en" }
            }
        }
        wx.setStorageSync(this.data.origin + 'Lang', actLang)
        app.globalData[this.data.origin + 'Lang'] = actLang
        this.setData({ curLang: actLang })        
        wx.navigateBack({
            delta: 1
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({ origin: options.origin })
        if (options.origin === 'from'){
            this.setData({ 
                title: '源语言', 
                opposeLang: app.globalData.toLang, 
                curLang: app.globalData.fromLang
            })
        } else if (options.origin === 'to') {
            this.setData({ 
                title: '目标语言',
                opposeLang: app.globalData.fromLang, 
                curLang: app.globalData.toLang
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: this.data.title
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})