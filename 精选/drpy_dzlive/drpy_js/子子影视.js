var rule = {
  title: '子子影视',
  host: 'https://www.ziziys.net/',
  url: '/vodshow/fyclass--------fypqge---.html[/list/fyclass.html]',
  searchUrl: '/search/**----------fypage---.html',
  header: {
    'User-Agent': 'MOBILE_UA',
    'Referer': 'https://www.ziziys.net/'
  },
  searchable: 2,
  quickSearch: 0,
  filterable: 0,
  class_parse: '.nav-menu-items&&li;a&&Text;a&&href;.*/(.*?).html',
  play_parse: true,
  lazy: `
    js:
    var html = request(input);
    // 1. 尝试直接解析JSON格式的视频数据
    try {
      var playerJson = html.match(/var player_aaaa=(.*?});/s);
      if (playerJson && playerJson[1]) {
        var json = JSON.parse(playerJson[1]);
        var url = json.url;
        if (json.encrypt == 1) {
          url = unescape(url);
        } else if (json.encrypt == 2) {
          url = base64Decode(url);
        }
        input = {parse: 0, jx: 0, url: url};
      }
    } catch (e) {
      console.log('JSON解析失败');
    }
    
    // 2. 如果JSON解析失败，处理播放器框架
    if (!input.url) {
      // 检查是否在播放器框架页内 (src包含/vod/player)
      if (input.includes('/vod/player')) {
        // 从框架页解析真实播放器URL
        var realPlayer = html.match(/<iframe[^>]*?id=['"]?playleft['"]?[^>]*src=['"](.*?)['"]/i);
        if (realPlayer && realPlayer[1]) {
          var playerUrl = realPlayer[1];
          // 构造绝对路径
          if (!playerUrl.startsWith('http')) {
            playerUrl = 'https://www.ziziys.net' + playerUrl;
          }
          // 标记需要进一步解析
          input = {parse: 1, url: playerUrl};
        }
      } 
      // 处理主页面中的播放器框架
      else {
        var iframeSrc = html.match(/<iframe[^>]*?id=['"]?player_if['"]?[^>]*src=['"](.*?)['"]/i);
        if (iframeSrc && iframeSrc[1]) {
          var absoluteUrl = iframeSrc[1].startsWith('http') ? 
            iframeSrc[1] : 
            'https://www.ziziys.net' + iframeSrc[1];
          input = {parse: 1, url: absoluteUrl};
        }
      }
    }
    
    // 3. 返回最终的播放信息
    if (input.url) {
      input.header = {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://www.ziziys.net/'
      };
    } else {
      input = {parse: 0, jx: 0, url: ''}; // 解析失败
    }
  `,
  limit: 6,
  double: true,
  推荐: '.module-list;.module-items&&.module-item;a&&title;img&&data-src;.module-item-text&&Text;a&&href',
  一级: '.module-items .module-item;a&&title;img&&data-src;.module-item-text&&Text;a&&href',
  二级: {
    title: 'h1&&Text;.tag-link&&Text',
    img: '.module-item-pic&&img&&data-src',
    desc: '.video-info-items:eq(3)&&Text;.tag-link:eq(2)&&Text;.tag-link:eq(1)&&Text;.video-info-items:eq(1)&&Text;.video-info-items:eq(0)&&Text',
    content: '.vod_content&&Text',
    tabs: '.module-tab-item',
    lists: '.module-player-list:eq(#id)&&.scroll-content&&a',
    tab_text: 'div--small&&Text',
  },
  搜索: '.module-items .module-search-item;a&&title;img&&data-src;.video-serial&&Text;a&&href',
};