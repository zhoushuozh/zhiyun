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

// 翻译
function _translate(q, {from = "atuo", to}) {
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

module.exports._debounce = _debounce
module.exports._throttle = _throttle
module.exports._translate = _translate