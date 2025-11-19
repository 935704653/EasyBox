#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#get壳lib里的so扔同目录,get2无加固无混肴直接apk扔同目录，加密的data自己抓写入对应文本，支出json格式和存加密格式

"""
AES-128-CBC 密钥爆破工具（支持APK文件直接解析）
用法：
  1) 把加密内容写进 encrypt.txt
  2) 把APK文件或DEX文件放进当前目录
  3) 运行：python3 flutter-key.py
"""

import os
import re
import base64
import json
import threading
import time
import zipfile
from queue import Queue
from Crypto.Cipher import AES

# -------------------- 全局配置 --------------------
found = False
result_key = ""
result_plaintext = ""
progress_counter = 0
total_attempts = 0
lock = threading.Lock()
stop_event = threading.Event()

# 预编译正则
HEX_PATTERN = re.compile(r'^[0-9a-fA-F]+$')
KEY_KEYWORDS = ['key', 'pass', 'secret', 'cipher', 'crypt', 'aes', 'encrypt', 'decrypt', 'token', 'signature']

# -------------------- 工具函数 --------------------
def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def save_results(key, plaintext):
    try:
        with open("key.txt", "w", encoding="utf-8") as f:
            f.write(key)
        with open("decrypt.txt", "w", encoding="utf-8") as f:
            f.write(plaintext)
        log(f"密钥已保存 -> key.txt")
        log(f"解密结果已保存 -> decrypt.txt")
        try:
            formatted = json.dumps(json.loads(plaintext), indent=2, ensure_ascii=False)
            log("解密内容预览（JSON）：\n" + (formatted[:500] + "..." if len(formatted) > 500 else formatted))
        except Exception:
            log("解密内容预览（文本）：\n" + (plaintext[:200] + "..." if len(plaintext) > 200 else plaintext))
    except Exception as e:
        log(f"保存结果失败：{e}")

# -------------------- 1. 查找APK和DEX文件 --------------------
def find_apk_and_dex_files():
    """查找APK和DEX文件"""
    files = []
    apk_files = [f for f in os.listdir('.') if f.endswith('.apk')]
    dex_files = [f for f in os.listdir('.') if f.endswith('.dex')]
    so_files = [f for f in os.listdir('.') if f.endswith('.so')]
    
    files.extend(apk_files)
    files.extend(dex_files)
    files.extend(so_files)
    
    log(f"找到 {len(apk_files)} 个APK, {len(dex_files)} 个DEX, {len(so_files)} 个SO文件")
    return files

# -------------------- 2. 从APK提取所有可能字符串 --------------------
def extract_strings_from_apk(apk_path):
    """从APK文件中提取所有可能的字符串"""
    strings = []
    try:
        with zipfile.ZipFile(apk_path, 'r') as zf:
            # 获取APK中所有文件列表
            file_list = zf.namelist()
            log(f"APK包含 {len(file_list)} 个文件")
            
            # 重点处理这些文件类型
            target_files = []
            for file in file_list:
                if any(file.endswith(ext) for ext in ['.dex', '.so', '.xml', '.json', '.properties']):
                    target_files.append(file)
                elif '/' not in file or file.startswith('assets/') or file.startswith('res/'):
                    target_files.append(file)
                # 特别处理lib目录下的所有SO文件（包括子目录）
                elif file.startswith('lib/') and file.endswith('.so'):
                    target_files.append(file)
            
            log(f"重点分析 {len(target_files)} 个关键文件")
            
            for i, file_path in enumerate(target_files):
                if i % 50 == 0:
                    log(f"  分析进度: {i}/{len(target_files)}")
                
                try:
                    with zf.open(file_path) as f:
                        data = f.read()
                    
                    # 从文件内容提取字符串
                    content_strings = extract_strings_from_binary_data(data, f"APK:{file_path}")
                    strings.extend(content_strings)
                    
                    # 从文件路径本身提取字符串（包名、路径名可能包含密钥）
                    path_strings = extract_strings_from_text(file_path, f"APK路径:{file_path}")
                    strings.extend(path_strings)
                    
                except Exception as e:
                    continue
                    
    except Exception as e:
        log(f"解析APK文件 {apk_path} 失败: {e}")
    
    return strings

def extract_strings_from_binary_data(data, source_info=""):
    """从二进制数据提取字符串"""
    strings = []
    
    # 方法1: 提取连续可打印ASCII字符
    matches = re.findall(b'[ -~]{16,}', data)
    for match in matches:
        try:
            s = match.decode('utf-8', errors='ignore')
            strings.append(s)
        except:
            continue
    
    # 方法2: 尝试UTF-16编码
    try:
        utf16_data = data.decode('utf-16-le', errors='ignore')
        utf16_matches = re.findall(r'[ -~]{16,}', utf16_data)
        strings.extend(utf16_matches)
    except:
        pass
    
    # 方法3: 提取类名、包名等（可能包含密钥）
    class_patterns = [
        rb'L([a-zA-Z0-9_$/]{16,});',  # DEX类名格式
        rb'([a-zA-Z0-9_$.]{16,})',    # 包名格式
    ]
    
    for pattern in class_patterns:
        matches = re.findall(pattern, data)
        for match in matches:
            try:
                if isinstance(match, bytes):
                    s = match.decode('utf-8', errors='ignore')
                else:
                    s = match
                if len(s) >= 16:
                    strings.append(s)
            except:
                continue
    
    return strings

def extract_strings_from_text(text, source_info=""):
    """从文本中提取可能的密钥字符串"""
    strings = []
    
    # 路径中的长字符串可能包含密钥
    path_parts = text.replace('/', '.').replace('\\', '.').split('.')
    for part in path_parts:
        if len(part) >= 16 and re.match(r'^[a-zA-Z0-9_]+$', part):
            strings.append(part)
    
    return strings

# -------------------- 3. 从DEX/SO文件提取字符串 --------------------
def extract_strings_from_dex_or_so(file_path):
    """从DEX或SO文件提取字符串"""
    strings = []
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
        
        log(f"扫描 {file_path} (大小: {len(data)} 字节)")
        strings = extract_strings_from_binary_data(data, file_path)
        
        # 去重
        unique_strings = list(set(strings))
        log(f"  {file_path}: 提取到 {len(unique_strings)} 个字符串")
        
        return unique_strings
        
    except Exception as e:
        log(f"读取文件 {file_path} 失败: {e}")
        return []

# -------------------- 4. 主提取函数 --------------------
def extract_strings(target_files):
    all_strings = []
    
    for file_path in target_files:
        log(f"正在提取 {file_path} 中的字符串...")
        
        if file_path.endswith('.apk'):
            strings = extract_strings_from_apk(file_path)
        else:
            strings = extract_strings_from_dex_or_so(file_path)
        
        # 为字符串评分（智能优先级）
        scored_strings = []
        for s in strings:
            score = 0
            
            # 关键词大幅加分
            if any(k in s.lower() for k in KEY_KEYWORDS):
                score += 100
            
            # 十六进制字符串加分
            if HEX_PATTERN.match(s):
                score += 50
            
            # 长度正好16字符大幅加分
            if len(s) == 16:
                score += 200
            elif 14 <= len(s) <= 18:
                score += 30
            
            # 类名格式加分（可能包含密钥）
            if re.match(r'^[a-zA-Z0-9_$./]+$', s) and '.' in s:
                score += 20
            
            scored_strings.append((score, s))
        
        # 按分数降序排列
        scored_strings.sort(key=lambda x: x[0], reverse=True)
        all_strings.extend([s[1] for s in scored_strings])
        
        # 显示前几个高分数字符串
        high_score_strings = [s[1] for s in scored_strings[:5] if s[0] > 50]
        if high_score_strings:
            log(f"  高分数字符串示例: {high_score_strings}")
    
    log(f"总计提取到 {len(all_strings)} 个字符串")
    return all_strings

# -------------------- 5. 生成 16 字符子串 --------------------
def gen_16_substrings(s):
    subs = []
    if len(s) < 16:
        return subs
    
    base_score = 0
    if HEX_PATTERN.match(s):
        base_score += 30
    if any(k in s.lower() for k in KEY_KEYWORDS):
        base_score += 50
    
    for i in range(len(s) - 15):
        sub = s[i:i + 16]
        score = base_score
        
        if HEX_PATTERN.match(sub):
            score += 40
        # 位置越靠前分数越高
        score += max(0, 20 - i // 3)
        
        subs.append((score, sub))
    
    subs.sort(key=lambda x: x[0], reverse=True)
    return [x[1] for x in subs]

# -------------------- 6. 解密函数 --------------------
def decrypt(ciphertext, key):
    try:
        if len(key) != 16:
            return None
        key_bytes = key.encode('latin-1')
        iv_bytes = key_bytes
        cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
        pt = cipher.decrypt(ciphertext)
        
        # PKCS7去除填充
        pad_len = pt[-1]
        if pad_len < 1 or pad_len > 16:
            return None
        if pt[-pad_len:] != bytes([pad_len]) * pad_len:
            return None
            
        pt = pt[:-pad_len]
        decoded = pt.decode('utf-8')
        
        # 验证解密结果
        if len(decoded) > 5 and any(c in decoded for c in ['{', '"', ':', '[', 'http', 'com', 'www']):
            return decoded
            
    except Exception:
        pass
    return None

# -------------------- 7. 多线程工作 --------------------
def worker(q, cipher, batch_size):
    global found, result_key, result_plaintext, progress_counter
    while not q.empty() and not stop_event.is_set():
        batch = []
        for _ in range(batch_size):
            if q.empty() or stop_event.is_set():
                break
            try:
                batch.append(q.get_nowait())
            except:
                break
        if not batch:
            break
        
        for k in batch:
            if stop_event.is_set():
                break
            r = decrypt(cipher, k)
            if r:
                with lock:
                    found = True
                    result_key, result_plaintext = k, r
                stop_event.set()
                save_results(k, r)
                log(f"🎉 找到有效密钥: {k}")
                break
        
        with lock:
            progress_counter += len(batch)
            if progress_counter % 1000 == 0 and not stop_event.is_set():
                percent = 100 * progress_counter / total_attempts
                log(f"进度: {progress_counter}/{total_attempts} ({percent:.1f}%)")

# -------------------- 8. 主流程 --------------------
def main():
    global total_attempts
    start = time.time()

    # 1) 查找文件
    target_files = find_apk_and_dex_files()
    if not target_files:
        log("未找到任何APK、DEX或SO文件")
        return

    # 2) 读取加密文件
    try:
        with open('encrypt.txt', encoding="utf-8") as f:
            content = f.read().strip()
        try:
            json_data = json.loads(content)
            b64 = json_data['data']
            log("检测到 JSON 格式，提取 data 字段")
        except (json.JSONDecodeError, KeyError):
            b64 = content
            log("未检测到 JSON，按纯 Base64 处理")
        cipher = base64.b64decode(b64)
        log(f"成功加载加密数据，长度：{len(cipher)} 字节")
    except Exception as e:
        log(f"读取加密文件失败：{e}")
        return

    # 3) 提取字符串
    strings = extract_strings(target_files)
    if not strings:
        log("未提取到可用字符串")
        return

    # 4) 生成候选密钥
    log("生成候选密钥...")
    keys = []
    for i, s in enumerate(strings):
        if i % 100 == 0:
            log(f"  处理字符串 {i}/{len(strings)}...")
        keys.extend(gen_16_substrings(s))
    
    # 去重
    seen = set()
    unique = []
    for k in keys:
        if k not in seen:
            seen.add(k)
            unique.append(k)
    
    total_attempts = len(unique)
    if total_attempts == 0:
        log("无候选密钥")
        return
    
    log(f"生成 {total_attempts} 个去重后候选密钥")
    log("前10个高优先级密钥:")
    for i, k in enumerate(unique[:10]):
        log(f"  {i+1}. {k}")

    # 5) 多线程爆破
    q = Queue()
    for k in unique:
        q.put(k)
    
    threads = []
    cpu = os.cpu_count() or 4
    num_threads = min(16, cpu * 2, total_attempts)
    batch = 50 if total_attempts > 10000 else 20
    
    log(f"启动 {num_threads} 线程，批量大小 {batch}")
    
    for _ in range(num_threads):
        t = threading.Thread(target=worker, args=(q, cipher, batch))
        t.daemon = True
        t.start()
        threads.append(t)

    # 6) 等待完成
    try:
        while not q.empty() and not stop_event.is_set():
            time.sleep(0.1)
        if stop_event.is_set():
            time.sleep(0.5)
    except KeyboardInterrupt:
        log("用户中断")
        stop_event.set()

    # 7) 结果
    if found:
        log(f"🎊 爆破成功！密钥 = 「{result_key}」")
    else:
        log("❌ 未找到有效密钥")
    log(f"总用时：{time.time()-start:.2f} 秒，已尝试：{progress_counter}/{total_attempts}")

if __name__ == "__main__":
    main()