import md5 from './md5.min.js'

const appid = '20181107000230998'
const key = 's6b4hUb3v7UW7NXetabI'

// 防抖
function _debounce(fn, delay) {
    let delays = delay || 500;
    let timer;
    return function () {
        let th = this;
        let args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            timer = null;
            fn.apply(th, args);
        }, delays);
    };
}

// 节流
function _throttle(fn, interval) {
    let last;
    let timer;
    let intervals = interval || 500;
    return function () {
        let th = this;
        let args = arguments;
        let now = +new Date();
        if (last && now - last < intervals) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                // fn.apply(th, args);
            }, intervals);
        } else {
            last = now;
            fn.apply(th, args);
        }
    };
}

// 百度翻译
function b_translate(q, {from = "atuo", to}) {
    return new Promise((resolve, reject) => {
        let salt = Date.now()
        let sign = md5(`${appid}${q}${salt}${key}`)
        wx.request({
            url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
            data: {
                q,
                from,
                to,
                appid,
                salt,
                sign
            },
            success(res) {
                if (res.data && res.data.trans_result) {
                    resolve(res.data)
                } else {
                    reject({ status: 'error', msg: '翻译失败' })
                    wx.showToast({
                        title: '翻译失败',
                        icon: 'none',
                        duration: 3000
                    })
                }
            },
            fail() {
                reject({ status: 'error', msg: '翻译失败' })
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                })
            }
        })
    })
}


const yd_appid = '546e5ec5ebf651ca'
const yd_key = 'A6hWbZcjTIdwJffyRrfVL0OzdB7LGhcs'

// 有道翻译
function y_translate(q, { from = "atuo", to = "auto" }) {
    return new Promise((resolve, reject) => {
        let salt = Date.now()
        let appKey = yd_appid
        let sign = md5(`${yd_appid}${q}${salt}${yd_key}`)
        let ext = 'mp3'
        let voice = 0
        wx.request({
            url: 'https://openapi.youdao.com/api',
            data: {
                q,
                from,
                to,
                appKey,
                salt,
                sign,
                ext,
                voice
            },
            success(res) {
                if (res.data.errorCode === '0') {
                    resolve(res.data)
                } else {
                    reject({ status: 'error', msg: '翻译失败' })
                    wx.showToast({
                        title: '翻译失败',
                        icon: 'none',
                        duration: 3000
                    })
                }
            },
            fail() {
                reject({ status: 'error', msg: '翻译失败' })
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                })
            }
        })
    })
}

module.exports._debounce = _debounce
module.exports._throttle = _throttle
module.exports.b_translate = b_translate
module.exports.y_translate = y_translate