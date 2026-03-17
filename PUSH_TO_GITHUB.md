# 推送到GitHub指令

## 仓库信息
- **GitHub URL**: https://github.com/mingshi/honest-price-tracker
- **远程仓库已配置**: `origin` → `git@github.com:mingshi/honest-price-tracker.git`

## 方法1：使用SSH密钥（推荐）

### 如果已有SSH密钥
```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker
git push -u origin main
```

### 如果没有SSH密钥
```bash
# 1. 生成SSH密钥（如果没有）
ssh-keygen -t ed25519 -C "your_email@example.com"
# 按Enter接受默认路径，设置密码（可选）

# 2. 复制公钥
cat ~/.ssh/id_ed25519.pub

# 3. 添加到GitHub
# 访问 https://github.com/settings/keys
# 点击 "New SSH key"
# 粘贴公钥内容

# 4. 测试连接
ssh -T git@github.com

# 5. 推送
cd /home/admin/.openclaw/workspace/honest-price-tracker
git push -u origin main
```

## 方法2：使用Personal Access Token

### 生成Token
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Classic"
3. 勾选权限：`repo` (全部子权限)
4. 生成并复制token（只显示一次！）

### 配置Git使用Token
```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker

# 切换回HTTPS URL
git remote set-url origin https://github.com/mingshi/honest-price-tracker.git

# 推送（会提示输入用户名和密码）
# Username: mingshi
# Password: <粘贴token，不是GitHub密码>
git push -u origin main

# （可选）保存凭据避免每次输入
git config credential.helper store
```

## 方法3：手动上传（最简单）

### 打包代码
```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker
git archive --format=zip --output=honest-price-tracker.zip main
```

### 上传到GitHub
1. 访问 https://github.com/mingshi/honest-price-tracker
2. 点击 "Add file" → "Upload files"
3. 拖拽 `honest-price-tracker.zip` 解压后的文件
4. 提交

---

## 当前本地提交记录

```bash
$ git log --oneline
[最新3个提交]
```

**已准备推送的内容**:
- 初始项目结构（Manifest V3配置）
- LICENSE (MIT) + CONTRIBUTING.md
- 域名注册和GitHub设置指南
- 增强隐私政策（11.8KB）
- Amazon价格提取器（349行 + 152行测试）
- IndexedDB存储层（692行，进行中）

---

## 推送后的下一步

1. ✅ 设置GitHub仓库描述和主题标签
2. ✅ 启用Issues和Discussions
3. ⏳ 配置域名（tokensdance.ai子域名）
4. ⏳ 继续开发核心功能
