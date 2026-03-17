# GitHub仓库设置指南

## 仓库信息

**仓库名**: `honest-price-tracker`  
**可见性**: Public  
**许可证**: MIT License  
**主分支**: `main`

---

## 创建步骤

### 1. 在GitHub创建仓库

1. 访问 https://github.com/new
2. 填写信息:
   - **Repository name**: `honest-price-tracker`
   - **Description**: `Privacy-first price tracker. No cookie hijacking. No fake coupons. Open source alternative to Honey.`
   - **Public** (必须公开)
   - ☑ Add a README file (取消勾选，我们已有README)
   - ☑ Add .gitignore (取消勾选，我们已有)
   - **Choose a license**: MIT License (或取消勾选，我们已创建LICENSE)
3. 点击 "Create repository"

### 2. 连接本地仓库

```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker

# 初始化Git (已完成)
git init

# 添加所有文件
git add -A

# 首次提交
git commit -m "Initial commit: Project structure and core files

- Manifest V3 configuration
- TypeScript setup with webpack
- Background service worker
- Content scripts for Amazon/eBay/Walmart
- Popup and options UI
- Technical validation report (DOM parsing 100% accurate)
- MIT License
- Contributing guidelines"

# 设置远程仓库 (替换YOUR_USERNAME)
git remote add origin git@github.com:YOUR_USERNAME/honest-price-tracker.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 3. 配置仓库设置

#### 基本设置 (Settings → General)

- **Features**:
  - ☑ Issues (接收bug报告和功能请求)
  - ☑ Discussions (社区讨论)
  - ☐ Sponsorships (暂不启用)
  - ☐ Projects (暂不启用)
  - ☐ Wiki (使用README代替)

- **Pull Requests**:
  - ☑ Allow squash merging
  - ☑ Allow merge commits
  - ☐ Allow rebase merging

#### 分支保护 (Settings → Branches)

为 `main` 分支设置保护规则:

- ☑ Require pull request reviews before merging
- ☐ Require status checks to pass (CI设置后启用)
- ☑ Require conversation resolution before merging
- ☐ Require signed commits (可选)
- ☑ Include administrators

#### Topics标签 (仓库首页)

添加以下标签以提高可见性:

```
chrome-extension
price-tracker
privacy
open-source
honey-alternative
shopping
amazon
ebay
walmart
typescript
manifest-v3
```

#### About描述

**Website**: `https://honest-price-tracker.com` (域名注册后)

**Description**:
```
Privacy-first price tracker Chrome extension. No cookie hijacking. No fake coupons. Just honest price tracking. Open source alternative to Honey.
```

---

## GitHub Actions CI/CD (可选)

创建 `.github/workflows/build.yml`:

```yaml
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build extension
      run: npm run build
    
    - name: Run tests
      run: npm test
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: extension-build
        path: dist/
```

---

## README徽章

在README顶部添加状态徽章:

```markdown
# Honest Price Tracker

[![Build Status](https://github.com/YOUR_USERNAME/honest-price-tracker/workflows/Build%20and%20Test/badge.svg)](https://github.com/YOUR_USERNAME/honest-price-tracker/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/YOUR_EXTENSION_ID.svg)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)
[![Users](https://img.shields.io/chrome-web-store/users/YOUR_EXTENSION_ID.svg)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)
[![Rating](https://img.shields.io/chrome-web-store/rating/YOUR_EXTENSION_ID.svg)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)

> Privacy-first price tracker. No cookie hijacking. No fake coupons. Just honest price tracking.
```

---

## 社区文件

确保以下文件存在:

- ✅ `README.md` - 项目主页
- ✅ `LICENSE` - MIT许可证
- ✅ `CONTRIBUTING.md` - 贡献指南
- ⏳ `CODE_OF_CONDUCT.md` (可选)
- ⏳ `SECURITY.md` (安全政策)
- ⏳ `.github/ISSUE_TEMPLATE/` (Issue模板)
- ⏳ `.github/PULL_REQUEST_TEMPLATE.md` (PR模板)

---

## GitHub Releases

### 首次发布 (v0.1.0 MVP)

发布时创建Release:

```bash
git tag -a v0.1.0 -m "Release v0.1.0: MVP

Features:
- Amazon/eBay/Walmart price tracking
- Local IndexedDB storage
- Price history charts
- Browser notifications
- 100% privacy-first (no data uploads)

Known limitations:
- No fake review detection (planned for v0.2.0)
- No coupon testing (planned for v0.2.0)
"

git push origin v0.1.0
```

在GitHub创建Release:
1. 进入 Releases → Draft a new release
2. 选择 tag `v0.1.0`
3. 填写Release notes (同tag消息)
4. 上传 `extension.zip` (构建后的扩展包)
5. 勾选 "This is a pre-release" (MVP阶段)
6. Publish release

---

## Star & Watch

提醒少爷:
1. ⭐ Star自己的仓库 (增加可信度)
2. 👁 Watch仓库 (接收Issues和PR通知)

---

## 下一步

**待少爷提供**:
1. GitHub用户名 (用于创建仓库)
2. 是否已有GitHub账号，还是需要创建新账号
3. 是否希望我使用现有账号还是创建组织账号 (推荐: 个人账号即可)

**我可以做的**:
- ✅ 本地Git仓库已初始化
- ✅ LICENSE已创建 (MIT)
- ✅ CONTRIBUTING.md已创建
- ✅ 所有文件已暂存 (`git add -A`)
- ⏳ 等待GitHub仓库URL后推送

---

## 快速命令

```bash
# 检查Git状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 推送到GitHub (仓库创建后)
git push -u origin main
```
