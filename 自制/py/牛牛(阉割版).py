from Crypto.Cipher import AES
from base.spider import Spider
import re,sys,time,json,base64,urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
sys.path.append('..')

class Spider(Spider):
    headers, host, parser, src2  = {
        'User-Agent': "okhttp/3.12.1",
        'Connection': "Keep-Alive",
        'Accept-Encoding': "gzip",
        'p': "android",
        'product': "Xiaomi",
        't': "",
        'd': "d47bd375e8e16d12",
        'os': "12",
        'v': "1.4.6",
        'y': "1",
        'pkg': "com.tupai.count"
    },'', [], {}

    def init(self, extend=''):
        try:
            host = extend.strip()
            if not host.startswith('http'):
                host = 'https://nnal.oss-cn-beijing.aliyuncs.com/nn.php'
            if not re.match(r'^https?://[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(:\d+)?/?$', host):
                host = self.fetch(host,headers=self.headers,verify=False).text
                host_data = self.decrypt(host,'@@bull!!!video$$')
                addresses = host_data.split('\n')
                host_list = [addr.strip() for addr in addresses if addr.strip()]
                host = host_list[0]
            self.host = host.rstrip('/')
            path = '/config'
            response = self.fetch(self.host + path, headers=self.headers).text
            data_ = self.decrypt(response, path)
            data = json.loads(data_)['data']
            self.parser = data['parser']
            return None
        except Exception as e:
            return None

    def homeContent(self, filter):
        if not self.host: return None
        path = '/types'
        response = self.fetch(self.host+path, headers=self.headers).text
        data_ = self.decrypt(response,path)
        data = json.loads(data_)['data']
        classes = []
        for i in data:
            if isinstance(i,dict) and i['type_extend']['version'] == '':
                classes.append({'type_id': i['type_id'], 'type_name': i['type_name']})
        return {'class': classes}

    def homeVideoContent(self):
        if not self.host: return None
        path = '/main'
        response = self.fetch(self.host + path, headers=self.headers).text
        data_ = self.decrypt(response, path)
        data = json.loads(data_)['data']
        videos = []
        for i in data:
            for j in i.get('list', []):
                videos.append({
                    'vod_id': j['vod_id'],
                    'vod_name': j['vod_name'],
                    'vod_pic': j['vod_pic'],
                    'vod_remarks': j['vod_remarks'],
                    'vod_year': j['vod_year']
                })
        return {'list': videos}

    def categoryContent(self, tid, pg, filter, extend):
        if not self.host: return None
        path = f'/list?class=&order=最新&type_id={tid}&area=&year=&state=&wd=&page={pg}'
        response = self.fetch(self.host + path, headers=self.headers).text
        data_ = self.decrypt(response, path)
        data = json.loads(data_)['data']
        return {'list': data, 'page': pg}

    def searchContent(self, key, quick, pg='1'):
        if not self.host: return None
        path = f'/list?class=&order=&type_id=&area=&year=&state=&wd={key}&page={pg}'
        response = self.fetch(self.host + path, headers=self.headers).text
        data_ = self.decrypt(response, path)
        data = json.loads(data_)['data']
        for i in data:
            vod_content = i.get('vod_content')
            vod_blurb = i.get('vod_blurb')
            if not vod_content and vod_blurb:
                i['vod_content'] = vod_blurb
        return {'list': data, 'page': pg}

    def detailContent(self, ids):
        if not self.host: return None
        path = f'/detail?vod_id={ids[0]}'
        response = self.fetch(self.host + path, headers=self.headers).text
        data_ = self.decrypt(response, path)
        data = json.loads(data_)['data']
        play_from, play_urls = [], []
        for i in data['sources']:
            player_id = i['player_id']
            for i2 in self.parser:
                if i2['player_id'] == player_id:
                    show = f"{i2['player_name']}({player_id})"
            play_url = []
            for j in i['episodes']:
                url = j['url']
                if url.startswith('http'):
                    play_url.append(f"{j['name']}${url}")
                else:
                    play_url = []
                    break
            if play_url:
                play_from.append(show)
                play_urls.append('#'.join(play_url))
        video = {
            'vod_id': data['vod_id'],
            'vod_name': data['vod_name'],
            'vod_pic': data['vod_pic'],
            'vod_remarks': data['vod_remarks'],
            'vod_year': data['vod_year'],
            'vod_area': data['vod_area'],
            'vod_actor': data['vod_actor'],
            'vod_director': data['vod_director'],
            'vod_content': data['vod_content'],
            'vod_play_from': '$$$'.join(play_from),
            'vod_play_url': '$$$'.join(play_urls)
        }
        return {'list': [video]}

    def playerContent(self, flag, id, vipflags):
        url = ''
        if re.match(r'https?:\/\/.*\.(m3u8|mp4|flv)', id):
            url = id
        return { 'jx': '0', 'parse': '0', 'url': url, 'header': {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'}}

    def decrypt(self, ciphertext_base64, key):
        key = key[:16].ljust(16, '0')
        ciphertext = base64.b64decode(ciphertext_base64)
        cipher = AES.new(key.encode('utf-8'), AES.MODE_ECB)
        plaintext = cipher.decrypt(ciphertext)
        padding_len = plaintext[-1]
        return plaintext[:-padding_len].decode('utf-8')

    def timestamp(self):
        return str(int(time.time() * 1000))

    def getName(self):
        pass

    def isVideoFormat(self, url):
        pass

    def manualVideoCheck(self):
        pass

    def destroy(self):
        pass

    def localProxy(self, param):
        pass

