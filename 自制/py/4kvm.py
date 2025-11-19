# 在playerContent方法中增加播放源优先级处理
def playerContent(self, flag, id, vipFlags):
    try:
        # 新增播放源优先级列表
        source_priority = [
            ('api', self._resolve_api_source),
            ('iframe', self._resolve_iframe_source),
            ('video_tag', self._resolve_video_tag),
            ('fallback', self._resolve_fallback)
        ]
        
        for source_type, resolver in source_priority:
            result = resolver(id)
            if result:
                return result
                
        return {'parse': 1, 'url': id, 'header': self.headers}
        
    except Exception as e:
        return {'parse': 1, 'url': id, 'header': self.headers}

# 新增电视剧集数检测的容错机制
def _get_episode_count(self, season_data, page_html):
    # 新增备用检测方案
    detection_methods = [
        self._detect_by_episode_container,
        self._detect_by_js_data,
        self._detect_by_page_text,
        self._detect_by_pagination
    ]
    
    for method in detection_methods:
        count = method(season_data, page_html)
        if count > 0:
            return min(count, 100)  # 限制最大集数
    
    return 1  # 默认值

# 新增分页检测方法
def _detect_by_pagination(self, season_data, page_html):
    pagination = season_data('.pagination a')
    if pagination:
        last_page = pagination.eq(-2).text().strip()
        if last_page.isdigit():
            return int(last_page)
    return 0

# 强化分类过滤的容错性
def filterTVShowsOnly(self, video_list):
    tv_keywords = {
        'url': ['/tvshows/', '/series/', '/season/'],
        'title': ['季', '集', '连载', '更新至'],
        'remarks': ['全\d+集', '更新至\d+集']
    }
    
    return [v for v in video_list if any(
        any(kw in v.get(field, '') for kw in keywords)
        for field, keywords in tv_keywords.items()
    )]
