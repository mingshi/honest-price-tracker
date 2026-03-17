# 域名配置指南

## 域名: honest-price-tracker.tokensdance.ai

**主域名**: tokensdance.ai (已拥有)  
**子域名**: honest-price-tracker.tokensdance.ai (待配置)

### 配置方式：添加子域名到现有主域名

**优势**:
- ✅ 无需额外域名注册费用（$0/年）
- ✅ 使用已有的tokensdance.ai品牌
- ✅ DNS配置更简单
- ✅ SSL证书自动覆盖（*.tokensdance.ai）

---

## 配置步骤（Cloudflare DNS）

### 1. 登录Cloudflare Dashboard

1. 访问 https://dash.cloudflare.com/
2. 选择 `tokensdance.ai` 域名
3. 进入 "DNS" → "Records"

### 2. 添加子域名DNS记录

**方案A：使用GitHub Pages（推荐）**
```
Type: CNAME
Name: honest-price-tracker
Content: mingshi.github.io
TTL: Auto
Proxy status: Proxied (橙色云朵)
```

**方案B：指向服务器IP（如果自托管）**
```
Type: A
Name: honest-price-tracker
Content: [服务器IP地址]
TTL: Auto
Proxy status: Proxied (橙色云朵)
```

### 3. 验证DNS传播

```bash
# 检查DNS解析（可能需要等待几分钟）
nslookup honest-price-tracker.tokensdance.ai

# 或使用dig
dig honest-price-tracker.tokensdance.ai
```

### 4. Cloudflare设置优化

**SSL/TLS设置**:
- SSL/TLS加密模式: "Full (strict)"（如果后端有SSL）或 "Flexible"（如果GitHub Pages）
- 始终使用HTTPS: 开启
- 自动HTTPS重写: 开启
- 最低TLS版本: TLS 1.2

**速度优化**:
- Auto Minify: 开启 (HTML, CSS, JS)
- Brotli压缩: 开启
- Rocket Loader: 可选

**安全性**:
- Bot Fight Mode: 开启
- Browser Integrity Check: 开启

---

## GitHub Pages配置

### 1. 创建CNAME文件

在仓库根目录创建 `CNAME` 文件:
```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker
echo "honest-price-tracker.tokensdance.ai" > CNAME
git add CNAME
git commit -m "Add CNAME for GitHub Pages"
git push
```

### 2. 在GitHub Settings启用

1. 访问 https://github.com/mingshi/honest-price-tracker/settings/pages
2. **Source**: 选择 `main` branch, `/` (root) 或 `/docs` folder
3. **Custom domain**: 输入 `honest-price-tracker.tokensdance.ai`
4. 点击 "Save"
5. 等待DNS检查通过（绿色✓）
6. 勾选 "Enforce HTTPS"（DNS验证后自动可用）

### 3. 等待DNS传播和SSL证书生成

- DNS传播: 1-10分钟（Cloudflare很快）
- SSL证书生成: GitHub自动生成，需要5-10分钟
- 验证: `https://honest-price-tracker.tokensdance.ai`

---

## 配置状态检查清单

**当前状态** (2026-03-17):
- [x] 主域名已拥有: tokensdance.ai ✅
- [ ] 子域名DNS记录已添加
- [ ] CNAME文件已创建并提交
- [ ] GitHub Pages已配置
- [ ] DNS验证通过
- [ ] HTTPS已启用

**验证命令**:
```bash
# 检查DNS解析
dig honest-price-tracker.tokensdance.ai

# 检查HTTPS
curl -I https://honest-price-tracker.tokensdance.ai

# 检查SSL证书
echo | openssl s_client -servername honest-price-tracker.tokensdance.ai -connect honest-price-tracker.tokensdance.ai:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 成本总结

| 项目 | 成本/年 |
|------|--------|
| 子域名 (tokensdance.ai) | **$0** (免费) ✅ |
| GitHub Pages托管 | **$0** (免费) ✅ |
| SSL证书 | **$0** (自动) ✅ |
| Cloudflare CDN | **$0** (免费计划) ✅ |

**总成本**: **$0/年** 🎉

---

## 备选方案

如果不使用子域名，可注册独立域名:

| 域名 | 价格/年 | 推荐度 |
|-----|--------|--------|
| honest-price-tracker.com | $9.77 | ⭐⭐⭐ |
| honestpricetracker.com | $9.77 | ⭐⭐ |
| honest-prices.com | $9.77 | ⭐⭐⭐ |
| honest-price-tracker.org | $12 | ⭐⭐ |

---

## 快速配置步骤总结

```bash
# 1. 在Cloudflare添加DNS记录
#    Type: CNAME
#    Name: honest-price-tracker
#    Content: mingshi.github.io
#    Proxied: Yes

# 2. 创建CNAME文件
cd /home/admin/.openclaw/workspace/honest-price-tracker
echo "honest-price-tracker.tokensdance.ai" > CNAME
git add CNAME
git commit -m "Add CNAME for GitHub Pages"
git push origin main

# 3. 在GitHub Pages设置自定义域名
#    访问: https://github.com/mingshi/honest-price-tracker/settings/pages
#    Custom domain: honest-price-tracker.tokensdance.ai

# 4. 等待5-10分钟验证和SSL生成

# 5. 访问测试
#    https://honest-price-tracker.tokensdance.ai
```
