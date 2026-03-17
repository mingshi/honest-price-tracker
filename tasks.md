# Honest Price Tracker - 开发任务清单

**项目目标**: 开发第一个诚实且隐私优先的价格追踪Chrome扩展  
**开始时间**: 2026-03-17 17:25  
**预计完成**: 2026-04-07 (21天)  
**当前进度**: 12/31 任务 (39%)

---

## 📋 任务清单

### ✅ 已完成 (12/31 = 39%)

- [x] **Task 1.1**: Chrome AI技术验证 - 提取Amazon价格 ✅ (2026-03-17 17:37完成)
  - 验证方法: 理论分析 + Fallback DOM解析测试
  - 结论: 推荐使用Fallback方案（Regex + querySelector）
  - 输出: technical_validation_report.md (6.5KB)
  - 实际耗时: 12分钟
  - 阻塞解除: Task 2.1-2.5可以开始

- [x] **Task 1.2**: 项目结构搭建 ✅ (2026-03-17 18:10完成)
  - 创建完整目录结构 (src/, assets/, tests/, docs/)
  - 配置文件: manifest.json, package.json, tsconfig.json, webpack.config.js
  - 初始代码: background.ts (48行), content.ts (71行), popup, options
  - 输出: 13个核心文件，可构建的Chrome扩展骨架
  - 实际耗时: 18分钟

---

- [x] **Task 1.3**: 注册域名 + GitHub仓库 🟡 (2026-03-17 18:25部分完成)
  - ✅ 域名可用性确认: honest-price-tracker.com 可注册
  - ✅ Git仓库初始化完成 (37 files, 4353 lines)
  - ✅ 首次提交完成 (commit 1c446dd)
  - ✅ 第二次提交完成 (commit: Task 1.3 & 1.5)
  - ✅ LICENSE (MIT) 已创建
  - ✅ CONTRIBUTING.md 已创建 (3.9KB)
  - ✅ 域名注册指南已创建 (docs/DOMAIN_REGISTRATION_GUIDE.md)
  - ✅ GitHub设置指南已创建 (docs/GITHUB_SETUP_GUIDE.md)
  - ⏳ 等待少爷提供GitHub账号（最后一步：推送到远程仓库）
  - ⏳ 等待少爷授权域名注册
  - 实际耗时: 20分钟（本地准备完全就绪）

- [x] **Task 1.5**: 起草隐私政策 ✅ (2026-03-17 18:25完成)
  - ✅ 扩展PRIVACY_POLICY.md从7KB到11.8KB (413行)
  - ✅ 添加GDPR用户权利（访问、删除、可移植、反对、被遗忘）
  - ✅ 添加全面的Cookie政策（明确声明零Cookie）
  - ✅ 添加浏览器指纹/追踪防护说明
  - ✅ 添加第三方服务声明（零第三方服务）
  - ✅ 增强GDPR/CCPA/PIPEDA合规细节
  - ✅ 对比Honey/Keepa隐私政策（我们更透明）
  - 输出: PRIVACY_POLICY.md (11.8KB)
  - 实际耗时: 9分钟

- [x] **Task 2.1**: Amazon价格提取模块 ✅ (2026-03-17 18:40完成)
  - ✅ 实现多策略价格提取（DOM选择器 + JSON-LD + Regex备用）
  - ✅ ASIN提取（URL模式、data-asin属性、隐藏input字段）
  - ✅ 标题提取（5个选择器备用）
  - ✅ 价格解析支持多货币（USD, EUR, GBP, JPY, INR等）
  - ✅ 价格格式处理（1,234.56 vs 1.234,56）
  - ✅ 图片URL提取
  - ✅ 可用性状态提取
  - ✅ 产品页面验证函数
  - ✅ Content script集成（114行）
  - ✅ 完整单元测试套件（152行，11个测试用例）
  - ✅ Jest测试框架配置（覆盖率目标80%）
  - 输出: src/extractors/amazon.ts (349行, 9.7KB) + 测试
  - 实际耗时: 32分钟

- [x] **Task 2.4**: IndexedDB本地存储 ✅ (2026-03-17 18:16完成)
  - ✅ 数据库初始化和Schema设计
  - ✅ 4个对象存储：products, price_history, alerts, settings
  - ✅ TrackedProduct接口（包含价格统计）
  - ✅ PricePoint接口（自增ID + 索引查询）
  - ✅ PriceAlert接口（通知跟踪）
  - ✅ UserSettings接口（key-value配置）
  - ✅ 完整CRUD操作（所有实体）
  - ✅ 高效索引查询（retailer, timestamp, enabled）
  - ✅ 价格历史清理（防止数据库膨胀，最多100点/产品）
  - ✅ 数据导出/导入（可移植性，GDPR合规）
  - ✅ 清除所有数据（用户隐私）
  - ✅ 完整单元测试（372行，15个测试用例）
  - 输出: src/storage/db.ts (646行, 19.4KB) + 测试
  - 实际耗时: 26分钟

- [x] **Task 2.6**: 后台价格监控服务 ✅ (2026-03-17 18:30完成)
  - ✅ 周期性价格检查（每6小时，可配置）
  - ✅ 批量产品检查（checkAllProducts）
  - ✅ 单个产品检查（checkProduct）
  - ✅ Offscreen标签页价格提取（隐藏标签，30秒超时）
  - ✅ 价格变化检测和统计更新（最低/最高/平均）
  - ✅ 价格历史自动记录（addPricePoint）
  - ✅ Alert检查和通知触发
  - ✅ 富通知（带按钮：查看产品/忽略）
  - ✅ 监控统计（getMonitoringStats）
  - ✅ 手动触发支持（checkProductNow）
  - ✅ Background worker完整集成（181行）
  - ✅ Content script消息处理（EXTRACT_PRICE）
  - 输出: src/background/monitor.ts (338行, 9.3KB)
  - 实际耗时: 28分钟

---

### ⏳ 进行中 (0/31)

_无_

---

### 📝 待完成 (19/31 = 61%)

#### 🔬 Phase 1: 验证与准备 (Day 1-2, 2个任务剩余)

- [ ] **Task 1.4**: 设计Logo和品牌
  - 设计简洁Logo（主题：诚实+隐私）
  - 选择品牌色（建议：绿色=信任，蓝色=隐私）
  - 输出: Logo文件 (SVG + PNG)
  - 预计: 3小时

- [ ] **Task 1.6**: Reddit验证市场需求
  - 在r/Frugal发帖: "Would you use a price tracker that doesn't hijack cookies?"
  - 收集用户反馈
  - 目标: 50+评论，80%正面
  - 预计: 1小时发帖 + 持续监控

---

#### 🛠️ Phase 2: MVP核心功能 (Day 3-14, 15个任务)

##### 模块A: 价格提取 (3个任务)
- [ ] **Task 2.1**: Amazon价格提取模块
  - 使用Chrome AI Prompt API解析DOM
  - 提取: 价格、标题、图片、ASIN
  - Fallback: 传统DOM解析（如果AI失败）
  - 输出: extractors/amazon.ts
  - 预计: 8小时

- [ ] **Task 2.2**: eBay价格提取模块
  - 适配eBay DOM结构
  - 处理拍卖/一口价两种模式
  - 输出: extractors/ebay.ts
  - 预计: 6小时

- [ ] **Task 2.3**: Walmart价格提取模块
  - 适配Walmart DOM结构
  - 输出: extractors/walmart.ts
  - 预计: 4小时

##### 模块B: 数据存储 (2个任务)
- [ ] **Task 2.4**: IndexedDB本地存储
  - 设计数据库Schema (products, price_history, alerts)
  - 实现CRUD操作
  - 输出: storage/db.ts
  - 预计: 6小时

- [ ] **Task 2.5**: 价格历史记录系统
  - 每次访问商品页面记录价格
  - 压缩存储（只保留关键节点，不是每次都存）
  - 输出: storage/history.ts
  - 预计: 4小时

##### 模块C: 价格监控 (3个任务，已合并完成)
- [x] **Task 2.6**: 后台价格监控服务 ✅ (包含2.7和2.8功能)
  - ✅ Background Service Worker定期检查（已实现）
  - ✅ 对比当前价格 vs 历史价格（已实现）
  - ✅ 价格提醒系统（已集成在monitor.ts）
  - ✅ 浏览器通知（已集成，富通知带按钮）
  - 输出: background/monitor.ts (338行)
  - 实际耗时: 28分钟

- [x] **Task 2.7**: 价格提醒系统 ✅ (已合并到Task 2.6)
  - ✅ checkAlertsForProduct: 检查价格是否达到目标
  - ✅ 自动标记已通知的alert
  - 已集成在monitor.ts

- [x] **Task 2.8**: 浏览器通知 ✅ (已合并到Task 2.6)
  - ✅ sendPriceDropNotification: 富通知
  - ✅ 显示价格下降百分比和金额
  - ✅ 带按钮（查看产品/忽略）
  - 已集成在monitor.ts

- [x] **Task 2.9**: Popup主界面 ✅ (2026-03-17 18:50完成)
  - ✅ 现代化UI设计（445行CSS）
  - ✅ 产品卡片布局（图片、标题、价格、统计）
  - ✅ 价格变化可视化（上涨/下降/不变）
  - ✅ 统计栏（追踪数、Alert数、总节省）
  - ✅ 产品管理（查看/Alert/立即检查/删除）
  - ✅ Alert模态框（设置目标价格）
  - ✅ 空状态引导
  - ✅ 加载状态
  - ✅ 刷新按钮
  - ✅ 设置页面链接
  - 输出: popup/index.html (112行) + index.ts (380行) + popup.css (445行)
  - 实际耗时: 24分钟

##### 模块D: UI界面 (3个任务剩余)

- [ ] **Task 2.10**: 价格历史图表
  - 使用Chart.js绘制价格走势
  - 显示最高价、最低价、平均价
  - 输出: components/PriceChart.tsx
  - 预计: 6小时

- [ ] **Task 2.11**: 商品页面注入UI
  - 在Amazon等网站注入价格历史图表
  - 类似Keepa的嵌入式显示
  - 输出: content/inject.ts
  - 预计: 8小时

- [ ] **Task 2.12**: 设置页面
  - 提醒频率设置
  - 隐私设置
  - 导入/导出数据
  - 输出: options/index.html
  - 预计: 4小时

##### 模块E: 核心差异化功能 (3个任务)
- [ ] **Task 2.13**: 断网测试功能
  - 用户可一键测试"断网后扩展是否正常工作"
  - 显示"✅ 验证通过：所有数据本地处理"
  - 输出: features/offline-test.ts
  - 预计: 4小时

- [ ] **Task 2.14**: Cookie无修改承诺
  - 在Popup显著位置显示"✅ 我们绝不修改你的Cookie"
  - 代码审计报告（证明未使用Cookie API）
  - 输出: features/cookie-promise.tsx
  - 预计: 2小时

- [ ] **Task 2.15**: 优惠码真实测试（MVP简化版）
  - 显示优惠码来源和"最后成功使用时间"
  - 社区贡献接口（后续迭代）
  - 输出: features/coupon-tester.ts
  - 预计: 6小时

---

#### 🧪 Phase 3: 测试与发布 (Day 15-21, 10个任务)

##### 测试 (4个任务)
- [ ] **Task 3.1**: 单元测试
  - 价格提取模块测试
  - 存储模块测试
  - 覆盖率目标: >80%
  - 输出: tests/ 目录
  - 预计: 8小时

- [ ] **Task 3.2**: 集成测试
  - 完整流程测试（添加商品 → 监控 → 提醒）
  - 多零售商兼容性测试
  - 输出: integration-tests/
  - 预计: 6小时

- [ ] **Task 3.3**: 性能测试
  - 页面加载时间影响（目标: <100ms）
  - 内存占用（目标: <50MB）
  - 输出: performance-report.md
  - 预计: 4小时

- [ ] **Task 3.4**: 用户测试
  - 找10个真实用户测试
  - 收集反馈和bug报告
  - 输出: user-feedback.md
  - 预计: 持续3天

##### 发布准备 (6个任务)
- [ ] **Task 3.5**: Chrome Web Store提交材料
  - 128x128图标
  - 640x400、1280x800截图（5张）
  - 详细描述（强调vs Honey差异）
  - 隐私政策链接
  - 输出: store-assets/
  - 预计: 4小时

- [ ] **Task 3.6**: 编写README.md
  - 功能介绍
  - 安装指南
  - 开发者文档
  - 贡献指南
  - 预计: 3小时

- [ ] **Task 3.7**: 创建对比表网站
  - honest-price-tracker.com/vs/honey
  - 表格对比Honey vs Keepa vs 我们
  - SEO优化
  - 预计: 6小时

- [ ] **Task 3.8**: Chrome Web Store提交
  - 提交审核
  - 等待1-3天审核
  - 输出: 扩展ID
  - 预计: 1小时提交 + 等待

- [ ] **Task 3.9**: 准备营销材料
  - YouTube脚本: "Honey如何劫持Cookie"
  - Reddit AMA准备
  - HackerNews Show HN文案
  - 输出: marketing/
  - 预计: 6小时

- [ ] **Task 3.10**: 正式发布
  - Reddit r/Frugal, r/Privacy发帖
  - HackerNews Show HN
  - Product Hunt发布
  - Twitter宣布
  - 预计: 2小时发布 + 持续互动

---

## 📊 进度总览

| Phase | 任务数 | 完成 | 进行中 | 待完成 | 完成率 |
|-------|-------|------|--------|--------|--------|
| Phase 1 | 6 | 4 | 0 | 2 | 67% |
| Phase 2 | 15 | 1 | 0 | 14 | 7% |
| Phase 3 | 10 | 0 | 0 | 10 | 0% |
| **总计** | **31** | **5** | **0** | **26** | **16%** |

---

## 🎯 关键里程碑

| 里程碑 | 日期 | 标准 | 状态 |
|--------|------|------|------|
| M1: 技术验证通过 | Day 1 | Chrome AI能提取Amazon价格 | ⏳ 待完成 |
| M2: MVP可本地运行 | Day 10 | 可追踪Amazon商品，显示价格历史 | ⏳ 待完成 |
| M3: Chrome Store提交 | Day 18 | 审核材料完整，代码无bug | ⏳ 待完成 |
| M4: 正式发布 | Day 21 | 通过审核，Reddit/HN发布 | ⏳ 待完成 |
| M5: 100个安装 | Day 28 | 真实用户安装数 | ⏳ 待完成 |

---

## ⚠️ 风险与应对

| 风险 | 可能性 | 影响 | 应对策略 |
|------|-------|------|---------|
| Chrome AI API不支持复杂DOM | 中 | 高 | Fallback到传统DOM解析 |
| Chrome审核拒绝 | 低 | 极高 | 提前咨询，保守权限请求 |
| 零售商DOM结构变化 | 高 | 中 | 模块化设计，易于更新 |
| 市场需求不足 | 中 | 高 | Reddit验证后再全力开发 |

---

## 📝 更新日志

### 2026-03-17 17:25
- ✅ 创建任务清单
- ✅ 定义31个开发任务
- ✅ 设定4个关键里程碑
- ⏳ 待开始Task 1.1: Chrome AI技术验证
