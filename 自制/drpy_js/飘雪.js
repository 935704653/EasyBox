
var rule = {
  title: '飘雪 ',
  desc: '许愿出品',
  模板:'首图2',
  host:'https://www.yjmyston.com',
  url: '/pxyy/fyclass-fypage.html',
  searchUrl: '/pxyysearch.html?wd=**&submit=',
  searchable:1,
 quickSearch:1,
 headers: {'User-Agent': 'PC_UA'},
 double:false,timeout:5000,
 play_parse:true,
 filterable:1,
 invalid:true,
 play_parse: true,
 lazy:`js:var html=JSON.parse(request(input).match(/r player_.*?=(.*?)</)[1]);
    log(html);
    var url=html.url;
    if(html.encrypt=='1'){
    url=unescape(url)
    }else if(html.encrypt=='2'){
    url=unescape(base64Decode(url))
    }
    if(/m3u8|mp4/.test(url)){
    input=url
    }else if(/qq|iqiyi/.test(url)){
    input={jx:0,url:'https://jx.m3u8.tv/jiexi/?url='+url,parse:1,header:JSON.stringify({'user-agent':'Mozilla/5.0'})}
    }else{
    input
    }`,
  

    cate_exclude:'排行榜',// 除开全局过滤之外还需要过滤哪些标题不视为分类
  tab_order:['','',''],//线路顺序,按里面的顺序优先，没写的依次排后面
 sniffer:1,//是否启用辅助嗅探: 1,0
 isVideo:"http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp|rm|rmvb|asf|m4a|mp3|wma)",// 辅助嗅探规则
  // 辅助嗅探规则js写法
 isVideo:`js:
    log(input);
    if(/m3u8/.test(input)){
    input = true
    }else{
    input = false
    }
    `,
    搜索:'ul.stui-vodlist__media,ul.stui-vodlist,#searchList li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href;.detail&&Text',
}
