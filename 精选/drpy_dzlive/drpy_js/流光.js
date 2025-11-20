var rule = {
    title: '流光影视',
    host: 'https://www.lgys.tv/',
    url: '/cn/category/fyclass?page=fypage',
    searchUrl: '/search?q=**',
    class_parse: '.uk-navbar-nav li:gt(0):lt(5);a&&Text;a&&href;.*/(.*/?)',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
    },
    play_parse: true,
    lazy: $js.toString(() => {
        let html = request(input);
        let id = html.match(/var\s+id\s*=\s*"([^"]+)"/)[1];
        console.log('id>>>>>' + id);
        
        let hd = html.match(/var\s+hd\s*=\s*"([^"]+)"/)[1];
        console.log('hd>>>>>' + hd);
        
        let url = `${HOST}/api/getmovie?type=${hd}&id=${id}`;
        
        let jxhtml = request(url);
        let videoUrl = JSON.parse(jxhtml).m3u8;
        if (videoUrl.startsWith('http')) {
            input = {parse: 0, jx: 0, url: videoUrl};
        } else {
            input = {parse: 0, jx: 0, url: HOST + videoUrl};
        }
    }),
    limit: 6,
    double: true,
    推荐: '.uk-slideshow-items;li;.uk-margin-remove&&Text;img&&src;.video-box-info&&Text;a&&href',
    一级: '.videos-lists .movie-card;.uk-card-body&&Text;img&&src;.video-box-info&&Text;a&&href',
    二级: {
        title: 'h1&&Text;.content_detail:eq(1)&&li&&a:eq(2)&&Text',
        img: 'img&&src',
        desc: '.uk-grid-small:eq(1)&&Text',
        content: '.uk-margin-small-top&&Text',
        tabs: '.hdselect',
        lists: '.uk-grid-match:eq(#id) li',
    },
    搜索: '*',
}