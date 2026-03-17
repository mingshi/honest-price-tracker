# Chrome AI Prompt API 技术验证指南

**测试目的**: 验证Chrome AI Prompt API能否准确提取电商网站商品价格

**创建时间**: 2026-03-17 17:25  
**状态**: 待测试

---

## 🧪 测试文件

**测试页面**: `chrome-ai-validation.html`

### 如何运行测试

#### 方法1: 在Chrome中直接打开（推荐）
```bash
# 在Chrome浏览器中打开测试页面
google-chrome /home/admin/.openclaw/workspace/honest-price-tracker/tests/chrome-ai-validation.html

# 或双击文件在默认浏览器打开
```

#### 方法2: 启动本地服务器
```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker/tests
python3 -m http.server 8000

# 然后访问: http://localhost:8000/chrome-ai-validation.html
```

---

## ⚙️ 前置条件

### 1. Chrome版本要求
- Chrome 128+ (Beta/Canary)
- 查看版本: `chrome://version`

### 2. 启用Chrome AI Flags
访问 `chrome://flags` 并启用以下功能:

1. **Optimization Guide On Device Model**
   - 搜索: `#optimization-guide-on-device-model`
   - 设置为: `Enabled BypassPerfRequirement`

2. **Prompt API for Gemini Nano**
   - 搜索: `#prompt-api-for-gemini-nano`
   - 设置为: `Enabled`

3. **重启Chrome**

### 3. 验证AI可用性
打开测试页面，点击"检查Chrome AI可用性"按钮。

---

## 📊 测试用例

### Test Case 1: Amazon价格提取 ✅
**样本HTML**:
```html
<span class="a-price-whole">19</span>
<span class="a-price-fraction">99</span>
<span id="productTitle">Wireless Mouse - Ergonomic Design</span>
```

**预期结果**:
```json
{
  "price": 19.99,
  "title": "Wireless Mouse - Ergonomic Design",
  "rating": 4.5
}
```

**成功标准**: 
- ✅ 价格提取准确（19.99）
- ✅ 标题提取完整
- ✅ 响应时间 <2秒

---

### Test Case 2: eBay价格提取 ✅
**样本HTML**:
```html
<span class="ux-textspans ux-textspans--BOLD">US $24.99</span>
<h1 class="x-item-title__mainTitle">Vintage Camera Lens</h1>
```

**预期结果**:
```json
{
  "price": 24.99,
  "title": "Vintage Camera Lens"
}
```

---

### Test Case 3: Walmart价格提取 ✅
**样本HTML**:
```html
<span class="price-characteristic" itemprop="price">34</span>
<span class="price-mantissa">97</span>
<h1 itemprop="name">LED Desk Lamp</h1>
```

**预期结果**:
```json
{
  "price": 34.97,
  "title": "LED Desk Lamp"
}
```

---

### Test Case 4: Fallback DOM解析 ✅
**目的**: 验证当Chrome AI不可用时，传统DOM解析是否可行

**方法**:
- 使用Regex提取价格: `/[\d,.]+/g`
- 使用querySelector定位元素
- 无需Chrome AI

**成功标准**: 3个测试用例100%准确

---

## 📝 测试结果记录

### 运行测试后填写

| 测试用例 | Chrome AI可用 | 提取准确 | 响应时间 | 备注 |
|---------|--------------|---------|---------|------|
| 可用性检查 | [ ] 是 [ ] 否 | N/A | N/A | |
| Amazon | [ ] 是 [ ] 否 | [ ] 是 [ ] 否 | ___秒 | |
| eBay | [ ] 是 [ ] 否 | [ ] 是 [ ] 否 | ___秒 | |
| Walmart | [ ] 是 [ ] 否 | [ ] 是 [ ] 否 | ___秒 | |
| Fallback | N/A | [ ] 是 [ ] 否 | ___秒 | |

---

## 🎯 测试结论

### 场景A: Chrome AI可用且准确
**策略**: 
- ✅ 使用Chrome AI作为主要提取方案
- ✅ Fallback作为备用（AI失败时）
- 预期准确率: 95%+

### 场景B: Chrome AI不可用或不准确
**策略**:
- ✅ 使用传统DOM解析（Regex + querySelector）
- ✅ 针对每个零售商定制选择器
- 预期准确率: 90%+

### 场景C: 两者都不理想
**备选方案**:
- ⚠️ 考虑使用第三方API（如Bright Data）
- ⚠️ 或限制支持的零售商数量（只做Amazon/eBay）

---

## 📋 下一步行动

根据测试结果决定：

### 如果Chrome AI测试通过 ✅
1. ✅ 继续开发，使用AI作为主要方案
2. ✅ 实现Fallback逻辑
3. ✅ 进入Task 1.2: 项目结构搭建

### 如果Chrome AI测试失败 ❌
1. ⚠️ 重新评估技术路线
2. ⚠️ 可能需要调整预期功能
3. ⚠️ 考虑只支持部分零售商

---

## ⏰ 测试时间预计

- 环境准备: 30分钟
- 运行测试: 30分钟
- 分析结果: 1小时
- 编写报告: 1小时
- **总计**: 3小时

**目标完成时间**: 2026-03-17 20:00

---

## 📧 测试报告模板

测试完成后，创建 `technical_validation_report.md`:

```markdown
# Chrome AI技术验证报告

**测试日期**: YYYY-MM-DD  
**测试人**: 卧龙  
**Chrome版本**: X.X.X.X

## 测试结果
- Chrome AI可用性: [是/否]
- 提取准确率: X%
- 平均响应时间: X秒

## 推荐方案
[主要方案] + [备用方案]

## 风险评估
[列出技术风险]

## 下一步
[根据结果决定Task 1.2是否继续]
```

---

**状态**: ⏳ 等待测试执行...
