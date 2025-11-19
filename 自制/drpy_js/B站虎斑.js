var rule = {
    title: '哔哩哔哩纯js所有分辨率版',
    vvv: '小虎斑适配',
    host:'https://api.bilibili.com',
    url:'/fyclass-fypage&vmid=$vmid',
    detailUrl:'/pgc/view/web/season?season_id=fyid',
    filter_url:'fl={{fl}}',
    vmid获取教程:'登录后访问https://api.bilibili.com/x/web-interface/nav,搜索mid就是,cookie需要 bili_jct,DedeUserID,SESSDATA参数',
    searchUrl:'/x/web-interface/search/type?keyword=**&page=fypage&search_type=',
    searchable:1,
    filterable:1,
    quickSearch:0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'User': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
        //'Cookie': token // 必须替换有效 Cookie
        'Cookie': 'http://127.0.0.1:9978/file/TVBox/bilibili.txt'
    },
    timeout: 5000,
    class_name: '全站&动画&音乐&舞蹈&游戏&知识&科技&运动&汽车&生活&美食&动物圈&鬼畜&时尚&娱乐&影视&纪录片',
    class_url: '0&1&13&167&3&129&4&36&188&234&223&160&211&217&119&155&5&181&177&23&11',
    getWrid: $js.toString(() =>{
        const md5 = str => CryptoJS.MD5(str).toString();
        const params = new URLSearchArgs(OBJECT.params);
        const wts = Math.floor(Date.now() / 1000);
        params.sort();
        params.set('wts', wts);
        const w_rid = md5(params.toString() + '9b288147e5474dd2aa67085f716ab560');
        return {w_rid, wts};
    }),
    推荐: $js.toString(() => {
        const res = JSON.parse(request('https://api.bilibili.com/x/web-interface/index/top/feed/rcmd?ps=20'));
        VODS = res.data.item.map(item => ({
            vod_id: item.bvid,
            vod_name: item.title,
            vod_pic: item.pic.replace(/^http:/, 'https:'),
            vod_remarks: `UP:${item.owner.name}  ${item.stat.view}`
        }));
    }),
    一级: $js.toString(() => {
        const url = `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${MY_CATE}&type=all&page=${MY_PAGE}`;
        const res = JSON.parse(request(url));
        VODS = res.data.list.map(item => ({
            vod_id: item.bvid,
            vod_name: item.title,
            vod_pic: item.pic,
            vod_remarks: `${item.rcmd_reason?.content || '推荐'}  ${item.stat?.view || 0}`
        }));
    }),
    // 二级详情 - 完全重写
    二级: $js.toString(() => {
        try {
            const bvid = input.match(/BV\w+/)?.[0];
            if (!bvid) throw new Error('无效的视频ID');
            const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
            const res = JSON.parse(request(apiUrl, {headers: rule.headers}));
            if (res.code !== 0) throw new Error(res.message || 'API请求失败');
            const data = res.data;
            // 生成分集列表
            const playList = data.pages.map((page, idx) =>
                `${page.part || `P${idx+1}`}$${bvid}_${page.cid}`
            ).join('#');
            VOD = {
                vod_id: bvid,
                vod_name: data.title,
                vod_pic: data.pic.startsWith('http') ? data.pic : 'https:' + data.pic,
                vod_content: data.desc.replace(/\n+/g, '\n'),
                vod_play_from: 'B站视频',
                vod_play_url: playList,
                vod_remarks: `${data.owner.name} | ${Math.floor(data.duration/60)}分钟`,
                vod_director: data.owner.name,
                vod_year: new Date(data.pubdate * 1000).getFullYear()
            };
        } catch (e) {
            VOD = {
                vod_name: '加载失败',
                vod_content: `错误信息: ${e.message}\n请检查Cookie有效性`
            };
        }
    }),
    play_parse:true,
    proxy_rule: $js.toString(() => {
        const result =  proxylist({
            aid: input.aid,
            cid: input.cid,
            qn: "120",
        });
        input =result;
    }),
    lazy: $js.toString(() => {
        const [bvid, cid] = input.split('_');
        let url = getProxyUrl()  + "&aid=" + bvid + "&cid=" + cid + "&qn=120" + "&type=mpd";
        const videoPage = `https://www.bilibili.com/video/${bvid}`;
        input = {
            parse: 0,
            url:url,
            danmaku:'https://api.bilibili.com/x/v1/dm/list.so?oid='+cid,
            format: 'application/dash+xml',
            header: JSON.
            stringify({
                "User-Agent": rule.headers.User,
                "Referer": videoPage,
                "Cookie": rule.headers.Cookie,
                "Range": "bytes=0-"
            })
        };
    }),
    搜索: $js.toString(() => {
        const url = `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(KEY)}&page=${MY_PAGE}`;
        const res = JSON.parse(request(url));
        const adKeywords = [
            '广告', '推广', '商业', '官方', '牛津师兄',
            '课程推荐', '付费', '训练营', '限时优惠'
        ];
        const adRegex = new RegExp(adKeywords.join('|'), 'i');
        VODS = res.data.result
            .filter(item => {
                // 综合判断多个广告特征
                const isAd = (
                    adRegex.test(item.title) ||
                    adRegex.test(item.author) ||
                    item.business === 'ad' ||
                    item.goto === 'ad' ||
                    (item.rcmd_reason && adRegex.test(item.rcmd_reason.content)) ||
                    item.duration < 60 // 过滤超短时长内容（广告特征）
                );
                return !isAd;
            })
            .map(item => ({
                vod_id: item.bvid,
                vod_name: item.title.replace(/<[^>]+>/g, ''),
                vod_pic: item.pic.replace(/^(http:)?\/\//, 'https://'),
                vod_remarks: `${item.author}  ${item.play}`
            }));
    })

};
globalThis.proxylist = function (params) {
    const aid = params.aid;
    const cid = params.cid;
    const qn = params.qn;
    const api = `https://api.bilibili.com/x/player/playurl?bvid=${aid}&cid=${cid}&qn=${qn}&fnval=4048&fourk=1`;
    const videoPage = `https://www.bilibili.com/video/${aid}`;
    let json = request(api, {
        headers: {
            "User-Agent": rule.headers.User,
            "Referer": videoPage,
            "Origin": "https://www.bilibili.com",
            "Cookie": rule.headers.Cookie,
        }
    });
    const resp = JSON.parse(json);
    const dash = resp.data.dash;
    const video = [];
    const audio = [];
    findAudio(dash, audio);
    findVideo(dash, video, qn);
    console.log(video)
    const mpd = getMpd(dash, video.join(''), audio.join(''));
    return [200, "application/dash+xml", mpd];
}
function getAudioFormat() {
    return {
        "30280": "192000",
        "30232": "132000",
        "30216": "64000"
    };
}
function findAudio(dash, sb) {
    const audioFormat = getAudioFormat();
    dash.audio.forEach(audio => {
        if (audioFormat[audio.id]) {
            sb.push(getMedia(audio));
        }
    });
}
function findVideo(dash, sb) {
    dash.video.forEach(video => {
        if (video.id) {
            sb.push(getMedia(video));
        }
    });
}
function getMedia(media) {
    if (media.mimeType.startsWith("video")) {
        return getAdaptationSet(media, `height='${media.height}' width='${media.width}' frameRate='${media.frameRate}' sar='${media.sar}'`);
    } else if (media.mimeType.startsWith("audio")) {
        return getAdaptationSet(media, `numChannels='2' sampleRate='${getAudioFormat()[media.id]}'`);
    } else {
        return "";
    }
}
function getAdaptationSet(media, params) {
    console.log(media);
    const id = `${media.id}_${media.codecid}`;
    const type = media.mimeType.split("/")[0];
    const baseUrl = media.baseUrl.replace(/&/g, '&amp;');

    return `<AdaptationSet>
        <ContentComponent contentType="${type}"/>
        <Representation id="${id}" bandwidth="${media.bandwidth}" codecs="${media.codecs}" mimeType="${media.mimeType}" ${params} startWithSAP="${media.startWithSap}">
            <BaseURL>${baseUrl}</BaseURL>
            <SegmentBase indexRange="${media.SegmentBase.indexRange}">
                <Initialization range="${media.SegmentBase.Initialization}"/>
            </SegmentBase>
        </Representation>
    </AdaptationSet>`;
}
function getMpd(dash, videoList, audioList) {
    return `<MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:mpeg:dash:schema:mpd:2011" xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd" type="static" mediaPresentationDuration="PT${dash.duration}S" minBufferTime="PT${dash.minBufferTime}S" profiles="urn:mpeg:dash:profile:isoff-on-demand:2011">
        <Period duration="PT${dash.duration}S" start="PT0S">
            ${videoList}
            ${audioList}
        </Period>
    </MPD>`;
}