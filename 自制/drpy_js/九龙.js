//获取vodlist  http://124.223.107.112:8894
globalThis.vodlist = function (t, pg) {
    let time = Date.now();
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'okhttp/3.12.11',
        }
    };
    let html = fetch('http://106.53.74.194:8767/apptov5/v1/vod/lists?type_id=' + t + '&area=&year=&order=time&type_name=&page=' + pg + '&pageSize=21', options);
    return JSON.parse(html);
}


globalThis.vodids = function (ids) {
        const options = {
            method: 'GET',
            headers: {
                'User-Agent': 'okhttp/3.12.11',
            }
        };
        let html = fetch('http://106.53.74.194:8767/apptov5/v1/vod/getVod?id=' + ids, options)
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

        // 遍历 vod_play_list 数组
        rdata.vod_play_list.forEach((value) => {
            data.vod_play_from += value.player_info.show + '|小虎斑|广告勿信$$$';

            // 遍历 urls 数组
            value.urls.forEach((v) => {
                data.vod_play_url += v.name + "$" + value.player_info.from + '|' + v.url + '|' + rdata.vod_name + '|' + v.name + "#";
            });

            data.vod_play_url += '$$$';
        });
        return data;
    }
    //console.log(vodids(153367));

globalThis.svodlist = function (wd) {
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'okhttp/3.12.11',
        }
    };
    let html = fetch('http://106.53.74.194:8767/apptov5/v1/search/lists?wd=' + wd + '&page=1&type=', options)
    return JSON.parse(html);
}

globalThis.jxx = function (id, nid) {
    let label;
    if (id == 'mao') {
        label = '猫';
    }
    if (id == 'caihong') {
        label = '彩虹';
    }
    if (id == 'bfzym3u8') {
        label = '暴风';
    }
    if (id == 'qiyi') {
        label = '奇异';
    }
    if (id == 'xigua') {
        label = '西瓜';
    }
    if (id == 'mgtv') {
        label = '芒果';
    }
    if (id == 'XCloud') {
        label = '新移动云盘';
    }
    if (id == 'bilibili') {
        label = '哔哩';
    }
    if (id == 'qq') {
        label = 'QQ';
    }
        if (id == 'youku') {
        label = '优酷';
    }
    if (id == 'Cloud') {
        label = '云盘';
    }
    const options = {
        method: 'POST',
        headers: {
            'User-Agent': 'Dart/2.19 (dart:io)',
            'appto-local-uuid': '406826e6-b6f6-4147-a321-d722275492a8'
        },
        body: {
            'play_url': nid,
            'label': label,
            'key': id
        }
    };
    let html = fetch('http://106.53.74.194:8767/apptov5/v2/parsing/proxy', options)
    console.log(html);
    return JSON.parse(html).data.url !==undefined ? JSON.parse(html).data.url : "解析失败";
}

globalThis.sss = function (wd) {
    let dm = request('https://dmku.thefilehosting.com/?ac=dm&url=' + wd);
    var html1 = fetch('http://154.9.252.167:666/tvbox/bm/dm.php', {
        method: 'POST',
        headers: {
            'User-Agent': 'okhttp/3.14.9',
        },
        body: {
            data: btoa(encodeURIComponent(dm)),
        }
    });
    return html1;
}

var rule = {
    title: '九龙',
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
        const parts = input.split('|');
        input = {
            parse: 0,
            url: jxx(parts[0], parts[1]),
            jx: 0,
            danmaku: '弹幕库接口' + '&jm=' + parts[2] + '&js=' + parts[3] + '&key=gunnimadeshabixiaotou'
        };

    }),
    推荐: $js.toString(() => {
        let bdata = vodlist(1, 1);
        console.log(bdata);
        let bata = bdata.data.data;
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
        let bata = bdata.data.data;
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
        ddata.data.data.forEach(it => {
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
