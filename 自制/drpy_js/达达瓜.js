var rule = {
  title: '达达瓜',
  host: 'https://dadagua.cc/',
  url: '/show/fyclass--------fypage---.html',
  searchUrl: '/vodsearch/**----------fypage---.html',
  searchable: 2,
  quickSearch: 0,
  filterable: 0,
  headers: {
    'User-Agent': 'UC_UA',
  },
  class_parse: '.stui-header__menu li:gt(0):lt(7);a&&Text;a&&href;.*/(.*?).html',
  play_parse: true,
  lazy: `js: 
  let pclick = 'document .querySelector("#playleft iframe").contentWindow.document.querySelector("#start").click()';
  input = { parse: 1, url: input, js: pclick, click: pclick}
   `,
  limit: 6,
  double: true,
  推荐: 'ul.stui-vodlist.clearfix;li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href',
  一级: '.stui-vodlist li;a&&title;a&&data-original;.pic-text&&Text;a&&href',
  二级: {
    title: '.stui-content__detail .title&&Text;.stui-content__detail&&p:eq(0)&&a:eq(1)&&Text',
    title1: '.stui-content__detail .title&&Text;.stui-content__detail&&p&&Text',
    img: '.stui-content__thumb .lazyload&&data-original',
    desc: '.stui-content__detail p&&Text;.stui-content__detail&&p:eq(0)&&a:eq(5)&&Text;.stui-content__detail&&p:eq(0)&&a:eq(4)&&Text;.stui-content__detail p:eq(2)&&Text;.stui-content__detail p:eq(1)&&Text',
    desc1: '.stui-content__detail p:eq(4)&&Text;;;.stui-content__detail p:eq(1)&&Text',
    content: '.stui-pannel_bd .col-pd&&Text',
    tabs: '.stui-pannel__head h3',
    tabs1: '.stui-vodlist__head h3',
    lists: '.stui-content__playlist:eq(#id) li',
  },
  搜索: 'ul.stui-vodlist__media,ul.stui-vodlist,#searchList li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href;.detail&&Text',
}