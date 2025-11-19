//获取vodlist  http://124.223.107.112:8894
const hostt = fetch('https://muouapp.oss-cn-hangzhou.aliyuncs.com/MUOUAPP/35174627.txt')
const data = fetch(`${hostt}/peizhi.php`)
// 解码 base64 编码的数据
let bsdata = JSON.parse(atob(data.substring(8, data.length - 1)));
let host = bsdata.HBqq;  // 获取 host 信息
let jx = bsdata.HBrjjg;  // 获取 jx 信息
let dm = bsdata.dmkuurl;  // 获取 dm 信息
let key1 = md5(bsdata.key).substring(0, 16);  // 使用 md5 生成密钥并取前 16 位
const cdata = { key1, host, jx, dm };  // 返回包含这些数据的对象
console.log(cdata)
var key = CryptoJS.enc.Base64.parse(btoa(key1));
var iv = CryptoJS.enc.Base64.parse(btoa(key1));
globalThis.AES_Decrypt = function (word) {
    try {
        var decrypt = CryptoJS.AES.decrypt(word, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const decryptedText = decrypt.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            throw new Error("解密后的内容为空");
        }
        return decryptedText;
    } catch (e) {
        console.error("解密失败:", e);
        return null;
    }
};

//console.log(cdata)

globalThis.vodlist = function (t, pg) {
    let time = Date.now();
    const options = {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.105 ',
            'brand-model': 'M2012K10C',
            'sys-version': '11',
            'device': '6132ea9af18fc022',
            'os': 'Android',
            'app-version': '4.1.6',
        },
        dy : {
            "class": "类型",
            "area": "地区",
            "lang": "语言",
            "year": "年份",
            "letter": "字母",
            "by": "排序",
            "sort": "排序",
        }
    };
    let html = fetch(cdata.host + '/api.php/v1.vod?type='+t+'&page='+pg+'&limit=18', options);
    html =  AES_Decrypt(html)
    html = '{"' + html;
    return JSON.parse(html);
}
globalThis.vodids = function (ids) {
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.105 ',
            'brand-model': 'M2012K10C',
            'sys-version': '11',
            'device': '6132ea9af18fc022',
            'os': 'Android',
            'app-version': '4.1.6',
        },
    };
    let html = fetch(cdata.host + '/api.php/v1.vod/detail?vod_id=' + ids, options)
    html =  AES_Decrypt(html)
    html = '{"' + html;
    let bata = JSON.parse(html);
    let rdata = bata.data;
    // 创建 data 对象并初始化
    let data = {
        vod_id: ids,
        vod_name: rdata.vod_name,
        vod_remarks: '小虎斑' + rdata.vod_remarks,
        vod_actor: rdata.vod_actor,
        vod_director: rdata.vod_director,
        vod_content: '小虎斑提醒你请勿相信任何广告——' + rdata.vod_content,
        vod_play_from: '',
        vod_play_url: ''
    };
    let list = rdata.vod_play_list;
    for (let i = 0; i < list.length; i++) {
        console.log(rdata.vod_play_list);
    }
    console.log(list);
    Object.values(list).forEach(value => {
        // 拼接 vod_play_from
        data.vod_play_from += value.player_info.show + '|小虎斑|广告勿信$$$';
        // 遍历 urls 对象并拼接 vod_play_url
        Object.values(value.urls).forEach((v) => {
            data.vod_play_url += v.name + "$" + value.player_info.from + '~' + v.url + '~' + rdata.vod_name + '~' + v.name + "#";
        });

        data.vod_play_url += '$$$';
    });
    return data;
}
//console.log(vodids(11093));

globalThis.svodlist = function (wd) {
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.105 ',
            'brand-model': 'M2012K10C',
            'sys-version': '11',
            'device': '6132ea9af18fc022',
            'os': 'Android',
            'app-version': '4.1.6',
        },
    };
    let html = fetch(cdata.host + '/api.php/v1.vod?wd='+wd+'&limit=18&page=1', options)
    html =  AES_Decrypt(html)
    html = '{"' + html;
    return JSON.parse(html);
}

console.log(svodlist);

globalThis.jxx = function (url) {
    return JSON.parse(request(cdata.jx+url,{})).url;
}

var rule = {
    title: '星河',
    host: '',
    detailUrl: 'fyid',
    searchUrl: '**',
    url: 'fyclass',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    class_name: '电影&电视剧&综艺&动漫',
    class_url: '1&2&3&4',
    play_parse: true,
    lazy: $js.toString(() => {
        const parts = input.split('~');
        input = {
            parse: 0,
            url: jxx(parts[1]),
            jx: 0,
            danmaku: '弹幕库接口' + '&jm=' + parts[2] + '&js=' + parts[3] + '&key=gunnimadeshabixiaotou'
        };

    }),
    推荐: $js.toString(() => {
        let bdata = vodlist(1, 1);
        console.log(bdata);
        let bata = bdata.data.list;
        bata.forEach(it => {
            d.push({
                url: it.vod_id,
                title: it.vod_name,
                img: it.vod_pic,
                desc: it.vod_remarks
            });
        });
        setResult(d);
    }),
    一级: $js.toString(() => {
        let bdata = vodlist(input, MY_PAGE);
        console.log(bdata);
        let bata = bdata.data.list;
        bata.forEach(it => {
            d.push({
                url: it.vod_id,
                title: it.vod_name,
                img: it.vod_pic,
                desc: it.vod_remarks
            });
        });
        setResult(d);
    }),
    二级: $js.toString(() => {
        console.log("调试信息2" + input);
        let data = vodids(input);
        //console.log(data);
        VOD = data;
    }),
    搜索: $js.toString(() => {
        let ddata = svodlist(input);
        console.log(ddata);
        let bata = ddata.data.list;
        bata.forEach(it => {
            d.push({
                url: it.vod_id,
                title: it.vod_name,
                img: it.vod_pic,
                desc: it.vod_remarks
            });
        });
        //  console.log(data);
        setResult(d);
    }),
}
