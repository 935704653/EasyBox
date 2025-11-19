
let HOST = 'http://42.194.167.3:31048';
let siteKey = "", siteType = "", sourceKey = "", ext = "";

async function request(reqUrl, options = {}) {
    const defaultOptions = {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
            'Referer': HOST
        },
    };
    
    const mergedOptions = {...defaultOptions, ...options};
    let res = await req(reqUrl, mergedOptions);
    return res.content;
}

function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    sourceKey = cfg.sourceKey;
    ext = cfg.ext;
    if (ext && ext.indexOf('http') == 0) {
        HOST = ext;
    }
}

async function home(filter) {
    const classes = [
        { type_id: "1", type_name: "电影" },    
        { type_id: "2", type_name: "电视剧" },
        { type_id: "3", type_name: "综艺" },
        { type_id: "4", type_name: "动漫" },
        { type_id: "5", type_name: "短剧" }
    ];
    const filterObj = {
"1":[{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"中国大陆","v":"中国大陆"},{"n":"香港","v":"香港"},{"n":"台湾","v":"台湾"},{"n":"韩国","v":"韩国"},{"n":"日本","v":"日本"},{"n":"美国","v":"美国"},{"n":"英国","v":"英国"},{"n":"法国","v":"法国"},{"n":"德国","v":"德国"},{"n":"意大利","v":"意大利"},{"n":"西班牙","v":"西班牙"},{"n":"印度","v":"印度"},{"n":"泰国","v":"泰国"},{"n":"俄罗斯","v":"俄罗斯"},{"n":"加拿大","v":"加拿大"},{"n":"澳大利亚","v":"澳大利亚"}]},{"key":"year","name":"时间","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"},{"n":"2014","v":"2014"},{"n":"2013","v":"2013"},{"n":"2012","v":"2012"},{"n":"2011","v":"2011"},{"n":"2010","v":"2010"}]},{"key":"lang","name":"语言","value":[{"n":"全部","v":""},{"n":"汉语","v":"汉语"},{"n":"英语","v":"英语"},{"n":"粤语","v":"粤语"},{"n":"闽南语","v":"闽南语"},{"n":"韩语","v":"韩语"},{"n":"日语","v":"日语"},{"n":"泰语","v":"泰语"},{"n":"法语","v":"法语"},{"n":"印地语","v":"印地语"},{"n":"意大利语","v":"意大利语"},{"n":"西班牙语","v":"西班牙语"},{"n":"俄语","v":"俄语"},{"n":"德语","v":"德语"}]},{"key":"sort","name":"排序","value":[{"n":"更新时间","v":"updateTime"},{"n":"豆瓣评分","v":"doubanScore"},{"n":"点击量","v":"hits"}]}]};
    const allTypeIds = classes.map(item => item.type_id);
    allTypeIds.forEach(type_id => {
        filterObj[type_id] = filterObj["1"];
    });

    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function homeVod() {
    const link = `${HOST}/index.php/appapi/getTypeRecommendList`;

    try {
        const response = await request(link);
        if (!response) return null;        
        const data = JSON.parse(response);
        
        if (data.code !== 0 || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
            return null;
        }

        // 遍历所有分类，提取每个分类下的recommend_list
        const videos = [];
        data.data.forEach(category => {
            if (category.recommend_list && Array.isArray(category.recommend_list) && category.recommend_list.length > 0) {
                category.recommend_list.forEach(item => {
                    videos.push({
                        vod_id: item.vod_id.toString(),
                        vod_name: item.vod_name,
                        vod_pic: item.vod_pic,
                        vod_remarks: item.vod_remarks || ''
                    });
                });
            }
        });

        // 如果没有任何视频，返回null
        if (videos.length === 0) {
            return null;
        }

        return JSON.stringify({
            list: videos
        });
    } catch (error) {
        console.log('homeVod error:', error);
        return null;
    }
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;

    // 构建查询参数 - 根据新的接口格式
    let params = `type_pid=0&page=${pg}&class=全部&year=全部&area=全部&lang=全部&sort=最新&type_id=${tid}`;
    
    // 添加筛选条件
    if (extend) {
        if (extend.area && extend.area !== "") params = params.replace(/area=全部/, `area=${extend.area}`);
        if (extend.year && extend.year !== "") params = params.replace(/year=全部/, `year=${extend.year}`);
        if (extend.lang && extend.lang !== "") params = params.replace(/lang=全部/, `lang=${extend.lang}`);
        
        // 排序映射
        if (extend.sort) {
            let sortMap = {
                "updateTime": "最新",
                "doubanScore": "评分", 
                "hits": "热门"
            };
            let sortValue = sortMap[extend.sort] || "最新";
            params = params.replace(/sort=最新/, `sort=${sortValue}`);
        }
    }

    const link = `${HOST}/index.php/appapi/typeFilterVodList?${params}`;

    try {
        const response = await request(link);
        if (!response) return JSON.stringify({list: []});

        const data = JSON.parse(response);
        
        // 根据抓包数据，正确的数据结构是：{code:0, msg:"success", data:[...]}
        if (data.code !== 0 || !data.data || data.data.length === 0) {
            return JSON.stringify({list: []});
        }

        const videos = data.data.map(item => ({
            vod_id: item.vod_id.toString(),
            vod_name: item.vod_name,
            vod_pic: item.vod_pic,
            vod_remarks: item.vod_remarks || item.vod_score || ''
        }));

        return JSON.stringify({
            list: videos            
        });
    } catch (error) {
        console.log('category error:', error);
        return JSON.stringify({
            list: []
        });
    }
}
async function search(wd, quick) {
    if (!wd) return JSON.stringify({list: []});

    const searchUrl = `${HOST}/index.php/appapi/searchList?type_id=0&keywords=${encodeURIComponent(wd)}&page=1`;

    try {
        const response = await request(searchUrl);
        
        if (!response) {
            return JSON.stringify({list: []});
        }

        const data = JSON.parse(response);
        
        // 根据抓包数据，正确的数据结构是：{code:0, msg:"success", data:[...]}
        if (data.code !== 0 || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
            return JSON.stringify({list: []});
        }

        // 过滤结果，只保留视频名称中包含搜索关键词的项
        const filteredData = data.data.filter(item => {
            const vodName = item.vod_name || '';
            const lowerWd = wd.toLowerCase();
            
            // 只检查视频名称是否包含关键词
            return vodName.toLowerCase().includes(lowerWd);
        });

        // 如果没有匹配的结果，返回空列表
        if (filteredData.length === 0) {
            return JSON.stringify({list: []});
        }

        const videos = filteredData.map(item => ({
            vod_id: item.vod_id ? item.vod_id.toString() : '',
            vod_name: item.vod_name || '未知标题',
            vod_pic: item.vod_pic || '',
            vod_remarks: item.vod_remarks || item.vod_score || item.vod_year || '',
            vod_year: item.vod_year || '',
            vod_area: item.vod_area || '',
            vod_actor: item.vod_actor || '',
            vod_content: item.vod_blurb || ''
        }));

        return JSON.stringify({
            list: videos
        });
    } catch (error) {
        console.log('search error:', error);
        return JSON.stringify({
            list: []
        });
    }
}

async function detail(id) {
    try {
        // 第一步：获取视频基本信息
        const detailUrl = `${HOST}/index.php/appapi/vodDetail?vod_id=${id}&token=bcb13708d797769b0eb1a4f7e32c3da6&v=v2`;
        const detailResponse = await request(detailUrl);
        
        if (!detailResponse) {
            return JSON.stringify({
                'list': []
            });
        }
        
        const detailData = JSON.parse(detailResponse);
        
        if (detailData.code !== 0 || !detailData.data || !detailData.data.vod) {
            return JSON.stringify({
                'list': []
            });
        }

        const item = detailData.data.vod;

        // 第二步：获取播放信息
        const playUrl = `${HOST}/index.php/appapi/vodsource?vod_id=${id}&token=bcb13708d797769b0eb1a4f7e32c3da6`;
        const playResponse = await request(playUrl);
        
        let playFrom = [];
        let playUrlList = [];
        
        if (playResponse) {
            const playData = JSON.parse(playResponse);
            
            if (playData.code === 0 && playData.data && Array.isArray(playData.data)) {
                // 定义要过滤掉的播放源
                const filteredSources = ['qq', 'mgtv', 'qiyi', 'youku', 'bilibili'];
                
                // 过滤可用的播放源并排除指定的播放源
                const availableSources = playData.data.filter(source => 
                    source.play_from_status === "1" && 
                    source.play_urls && 
                    source.play_urls.length > 0 &&
                    !filteredSources.includes(source.play_from_code)
                );
                
                // 定义播放源优先级顺序
                const playSourcePriority = {
                    'Ace': 1,      // 最高优先级
                    'Ace_JP': 2,   // AcJ
                    'YYNB': 3,     // 推荐线路①
                    'NSYS': 4,     // 推荐线路②
                    'rose': 5,     // 推荐线路③
                    'aiappslys': 6, // 推荐线路④
                    'xygz': 7,     // 推荐线路⑤
                    'NBY': 8,      // 推荐线路⑥
                    'xyxl': 9,     // 推荐线路⑦
                    'xynm': 10     // 推荐线路⑧
                };
                
                // 按优先级排序
                availableSources.sort((a, b) => {
                    const priorityA = playSourcePriority[a.play_from_code] || 999;
                    const priorityB = playSourcePriority[b.play_from_code] || 999;
                    return priorityA - priorityB;
                });
                
                // 构建播放列表
                availableSources.forEach(source => {
                    // 使用 play_from_name 作为线路名称（中文名）
                    playFrom.push(source.play_from_name);
                    
                    const episodes = source.play_urls.map(episode => {
                        // 只返回原始的 episode.url，不添加前缀
                        return `${episode.name}$${episode.url}`;
                    }).join('#');
                    
                    playUrlList.push(episodes);
                });
            }
        }

        const vod = {
            'vod_id': id,
            'vod_name': item.vod_name || '未知标题',
            'vod_pic': item.vod_pic || '',
            'type_name': item.vod_class || '',
            'vod_content': item.vod_blurb || '',
            'vod_director': item.vod_director || '',
            'vod_actor': item.vod_actor || '',
            'vod_year': item.vod_year || '',
            'vod_area': item.vod_area || '',
            'vod_remarks': item.vod_remarks || item.vod_score || '',
            'vod_play_from': playFrom.join('$$$'),
            'vod_play_url': playUrlList.join('$$$')
        };
        
        return JSON.stringify({
            'list': [vod]
        });
    } catch (e) {
        console.log('detail error:', e);
        return JSON.stringify({
            'list': []
        });
    }
}
async function play(flag, id, flags) {
    try {
        // 建立中文线路名到播放源代码的映射
        const nameToCodeMap = {
            "推荐线路①": "YYNB",
            "推荐线路②": "NSYS", 
            "推荐线路③": "rose",
            "推荐线路④": "aiappslys",
            "推荐线路⑤": "xygz",
            "推荐线路⑥": "NBY",
            "推荐线路⑦": "xyxl",
            "推荐线路⑧": "xynm",
            "Ac": "Ace",
            "AcJ": "Ace_JP"
        };
        
        // 根据中文线路名获取播放源代码
        const playFromCode = nameToCodeMap[flag];
        
        // 如果没有找到映射，直接返回原始ID
        if (!playFromCode) {
            return JSON.stringify({
                parse: 0,
                url: id
            });
        }

        // 解析接口配置映射
        const parseConfig = {
            "YYNB": { use_parse: true, parse_url: "https://json.cfysoft.cc/api/?key=7506ced6f26d3aa23636e4e35cbf600c&url=" },
            "NSYS": { use_parse: true, parse_url: "http://nsvip.hundong.xyz/api/?key=ddjQtdErVAOHRXDe7W&url=" },
            "rose": { use_parse: true, parse_url: "https://ll9-beta-tos.1ljx.com/vipjk.php?u=@BrookMao_093012&url=" },
            "aiappslys": { use_parse: true, parse_url: "http://jx.aikansl.com/api/?key=wQ5fzu1eiv7eet82MI&url=" },
            "xygz": { use_parse: true, parse_url: "https://jx.84jia.com/api/?key=rc4qjSqZr2z9DFDchk&url=" },
            "NBY": { use_parse: true, parse_url: "https://api.nbyjson.top:7788/api/?key=28WvxCOKQZwwrSrTXx&url=" },
            "xyxl": { use_parse: true, parse_url: "https://jx.84jia.com/api/?key=rc4qjSqZr2z9DFDchk&url=" },
            "xynm": { use_parse: true, parse_url: "https://jx.84jia.com/api/?key=rc4qjSqZr2z9DFDchk&url=" },
            "Ace_JP": { use_parse: true, parse_url: "/index.php/appapi/acejpjx?url=" },
            "Ace": { use_parse: true, parse_url: "http://110.40.137.168:5000/api/jiexi/common?Key=m3RmyT8SlYBe9UQrhY&url=" }
        };

        // 获取当前播放源的配置
        //http://42.194.167.3:31048/index.php/appapi/player
        const config = parseConfig[playFromCode];
        
        if (!config) {
            // 如果没有找到配置，直接返回原始ID
            return JSON.stringify({
                parse: 0,
                url: id
            });
        }

        // 如果不需要解析，直接返回原始ID
        if (!config.use_parse || !config.parse_url) {
            return JSON.stringify({
                parse: 0,
                url: id
            });
        }

        // 构造解析请求URL
        let parseUrl = config.parse_url;
        
        // 如果是相对路径，添加HOST
        if (parseUrl.startsWith("/")) {
            parseUrl = `${HOST}${parseUrl}`;
        }
        
        // 添加要解析的URL
        const playUrl = `${parseUrl}${encodeURIComponent(id)}`;
        
        const response = await request(playUrl);
        if (!response) {
            return JSON.stringify({
                parse: 0,
                url: id
            });
        }
        
        const data = JSON.parse(response);
        
        // 根据抓包数据，正确的数据结构是：{"code":200,"url":"播放地址","msg":"...","type":"hls"}
        if (data.code === 200 && data.url) {
            // 如果是HLS流，设置parse为1，否则为0
            const parseType = data.type === "hls" ? 1 : 0;
            
            return JSON.stringify({
                parse: parseType,
                url: data.url
            });
        }
        
        // 解析失败，返回原始ID
        return JSON.stringify({
            parse: 0,
            url: id
        });
    } catch (e) {
        return JSON.stringify({
            parse: 0,
            url: id
        });
    }
}
export function __jsEvalReturn() {
    return {
        init: init,
        detail: detail,
        home: home,
        play: play,
        homeVod: homeVod,
        category: category,
        search: search
    };
}