function main(item) {
// 酷9壳 JS专用 适用于1.3.4版本及以后
// 仅限安徽联通内网使用，可回放&时移
// 使用方式 http://PLTV/ku9/js/AHunicom.js?id=cctv1
    let url = item.url;
    const id = ku9.getQuery( url, "id" );
    const playseek = ku9.getQuery( url, "playseek" );
    
     // 定义频道ID与UUID的映射关系
    const n = {
    	//第一个参数，哪种链接头；第二个参数，末尾标志ID
    	//央视
        'cctv1': [0,"152"], // CCTV-1 综合 
        'cctv2': [0,"477"], // CCTV-2 经济
        'cctv3': [0,"487"], // CCTV-3 音乐
        'cctv4': [0,"573"], // CCTV-4 中文国际
        'cctv5': [0,"481"], // CCTV-5 体育
        'cctv5p': [0,"153"], // CCTV-5+ 体育赛事
        'cctv6': [2,"005"], // CCTV-6 电影
        'cctv7': [0,"485"], // CCTV-7 国防军事
        'cctv8': [0,"476"], // CCTV-8 电视剧
        'cctv9': [0,"478"], // CCTV-9 纪录
        'cctv10': [0,"480"], // CCTV-10 科教
        'cctv11': [0,"583"], // CCTV-11 戏曲
        'cctv12': [0,"482"], // CCTV-12 社会与法
        'cctv13': [0,"602"], // CCTV-13 新闻
        'cctv14': [0,"483"], // CCTV-14 少儿
        'cctv15': [0,"587"], // CCTV-15 音乐
        'cctv16': [0,"625"], // CCTV-16 奥林匹克
        'cctv17': [0,"580"], // CCTV-17 农业农村
        'cgtn': [0,"148"], // CGTN
        'cetv1': [0,"463"], // CETV-1
        //央视数字媒体系列
        'bqkj': [1,"053"], // CCTV-兵器科技
        'fyyy': [1,"037"], // CCTV-风云音乐
        'fyzq': [1,"051"], // CCTV-风云足球
        'fyjc': [1,"041"], // CCTV-风云剧场
        'dyjc': [1,"039"], // CCTV-第一剧场
        'hjjc': [1,"043"], // CCTV-怀旧剧场
        'whjp': [1,"057"], // CCTV-文化精品
        'nxss': [1,"055"], // CCTV-女性时尚
        'gfwq': [1,"049"], // CCTV-高尔夫网球
        'ystq': [1,"047"], // CCTV-央视台球
        //卫视系列
        'ahws': [0,"039"], // 安徽卫视
        'zjws': [0,"265"], // 浙江卫视
        'dfws': [4,"263"], // 东方卫视
        'hunws': [0,"195"], // 湖南卫视
        'bjws': [0,"194"], // 北京卫视
        'jsws': [0,"198"], // 江苏卫视
        'szws': [0,"197"], // 深圳卫视
        'gdws': [0,"445"], // 广东卫视
        'dnws': [0,"588"], // 东南卫视
        'tjws': [0,"266"], // 天津卫视
        'hebws': [0,"575"], // 河北卫视
        'hljws': [0,"196"], // 黑龙江卫视
        'sdws': [0,"470"], // 山东卫视
        'gzws': [0,"577"], // 贵州卫视
        'hubws': [0,"267"], // 湖北卫视
        'lnws': [0,"472"], // 辽宁卫视
        'gsws': [0,"603"], // 甘肃卫视
        'jlws': [0,"619"], // 吉林卫视
        'hanws': [5,"003"], // 海南卫视
        //其它
        'hxjc': [6,"005"], // 欢笑剧场
        
        'jyjs': [0,"569"], // 金鹰纪实
        'jykt': [0,"151"], // 金鹰卡通
        'kksr': [0,"150"], // 卡酷少儿
        'jjkt': [0,"448"], // 嘉佳卡通
    };
    //定义链接头，安徽联通目前有6种
    const liveUrlHeader = [
       //0 大多数频道
       "http://10.255.126.3:8006/AHBKLIVE/00000001000000050000000000000",
       //1 兵器科技 风云系列 剧场系列 文化精品 高尔夫 台球等
       "http://10.255.126.3:8006/AHBKLIVE/11111120210421000000000000000",
       //2 cctv-6
       "http://10.255.126.3:8006/AHBKLIVE/11111120220816000000000000000",
       //3 cctv-16 改为正常0
       "http://10.255.126.3:8006/AHBKLIVE/11111120211027000000000000000",
       //4 东方卫视
       "http://10.255.126.3:8006/AHBKLIVE/00005000000000000000000000000",
       //5 海南卫视
       "http://10.255.126.3:8006/AHBKLIVE/12000000000000000000000000000",
       //6 欢笑剧场-测试
       "http://10.255.126.3:8006/AHBKLIVE/11111120240912000000000000000"
    ];
        
    if (!n[id]) {
         return JSON.stringify({error: '未知的频道ID: ' + id});
    }
    let idHeader = n[id][0];
    let liveUrl = liveUrlHeader[idHeader] + n[id][1];
    
    
    let finalUrl;
    if (!playseek) {
        finalUrl = liveUrl;
    } else {
        //let time =  playseek + "9";
        //let starttime = time.slice(0,14);
        //let endtime = time.slice(15,29);
        finalUrl = liveUrl + "?playseek=" + playseek;
        // + "&starttime=" + starttime + "&endtime=" + endtime;
    }
       
                  
    return JSON.stringify({url:finalUrl});
}



