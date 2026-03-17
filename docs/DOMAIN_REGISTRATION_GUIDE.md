# 域名注册指南

## 域名: honest-price-tracker.com

### 注册商推荐

| 注册商 | 价格/年 | 优点 | 缺点 |
|--------|--------|------|------|
| **Cloudflare** | $9.77 | 最便宜，免费WHOIS隐私 | 需要转入（第一年可能无法使用）|
| **Namecheap** | $13.98 | 可靠，免费WHOIS隐私 | 续费价格较高 |
| **GoDaddy** | $11.99 (首年) | 知名，易用 | 续费贵（$17.99/年），推销多 |
| **Porkbun** | $10.13 | 便宜，干净界面 | 知名度低 |

**推荐**: Cloudflare (最便宜) 或 Namecheap (最稳定)

---

## 注册步骤 (Cloudflare)

### 1. 检查域名可用性
```bash
# 方法1: DNS查询
nslookup honest-price-tracker.com

# 方法2: WHOIS查询
whois honest-price-tracker.com
```

### 2. 在Cloudflare注册

1. 访问 https://www.cloudflare.com/
2. 登录账号
3. 进入 "Domain Registration"
4. 搜索 "honest-price-tracker.com"
5. 添加到购物车
6. 结账付款 ($9.77)

### 3. 配置DNS

**A记录** (如果需要网站):
```
Type: A
Name: @
Content: [服务器IP]
TTL: Auto
```

**CNAME记录** (如果使用GitHub Pages):
```
Type: CNAME
Name: @
Content: YOUR_USERNAME.github.io
TTL: Auto
```

### 4. 启用HTTPS

1. 在Cloudflare Dashboard启用 "Always Use HTTPS"
2. 设置SSL/TLS模式为 "Full" 或 "Full (strict)"

---

## 注册步骤 (Namecheap)

### 1. 访问Namecheap

1. 前往 https://www.namecheap.com/
2. 搜索 "honest-price-tracker.com"
3. 添加到购物车

### 2. 结账

- 价格: $13.98/年
- 自动包含 WhoisGuard (隐私保护)
- 可用支付宝/PayPal/信用卡

### 3. 配置DNS

在 "Advanced DNS" 选项卡:

**如果托管在服务器**:
```
Type: A Record
Host: @
Value: [服务器IP]
TTL: Automatic
```

**如果使用GitHub Pages**:
```
Type: CNAME Record
Host: @
Value: YOUR_USERNAME.github.io
TTL: Automatic
```

---

## GitHub Pages配置

### 1. 创建CNAME文件

在仓库根目录创建 `CNAME` 文件:
```
honest-price-tracker.com
```

### 2. 在GitHub Settings启用

1. 进入仓库 Settings
2. 滚动到 "GitHub Pages"
3. 选择 Source: `main` branch, `/` (root)
4. 输入 Custom domain: `honest-price-tracker.com`
5. 勾选 "Enforce HTTPS"

### 3. 等待DNS传播

- DNS传播需要 10分钟 - 48小时
- 检查: `nslookup honest-price-tracker.com`

---

## 域名状态检查

**当前状态** (2026-03-17):
- [ ] 域名可用性已确认
- [ ] 域名已注册
- [ ] DNS已配置
- [ ] GitHub Pages已连接
- [ ] HTTPS已启用

**验证命令**:
```bash
# 检查DNS解析
dig honest-price-tracker.com

# 检查HTTPS
curl -I https://honest-price-tracker.com

# 检查WHOIS
whois honest-price-tracker.com
```

---

## 成本总结

| 项目 | 成本/年 |
|------|--------|
| 域名注册 (Cloudflare) | $9.77 |
| 域名注册 (Namecheap) | $13.98 |
| GitHub Pages | 免费 |
| SSL证书 | 免费 (Let's Encrypt) |

**推荐总成本**: $9.77/年 (Cloudflare)

---

## 备选域名

如果 `honest-price-tracker.com` 不可用:

1. `honest-price-tracker.org` ($12/年)
2. `honest-price-tracker.io` ($32/年，开发者友好)
3. `honestpricetracker.com` ($10/年，无连字符)
4. `honest-prices.com` ($10/年，更短)
5. `no-honey.com` ($10/年，直接对标)

---

## 下一步

1. 少爷确认注册商 (Cloudflare / Namecheap)
2. 提供账号或授权我注册
3. 注册完成后配置DNS
4. 创建GitHub仓库并连接域名
