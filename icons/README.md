# Extension Icons

## Current Status

**SVG Source**: `icon.svg` (完成)
- 设计: 盾牌 + 对勾 + 价格标签
- 配色: 绿色(信任) + 蓝色(隐私)

**PNG Icons**: 需要生成
- icon-16.png (16x16)
- icon-32.png (32x32)
- icon-48.png (48x48)
- icon-128.png (128x128)

## 如何生成PNG图标

### 方法1: ImageMagick (服务器端)
```bash
convert icon.svg -resize 16x16 icon-16.png
convert icon.svg -resize 32x32 icon-32.png
convert icon.svg -resize 48x48 icon-48.png
convert icon.svg -resize 128x128 icon-128.png
```

### 方法2: 在线工具
1. 访问 https://svgtopng.com/
2. 上传 icon.svg
3. 下载 16x16, 32x32, 48x48, 128x128

### 方法3: Chrome浏览器
1. 打开 icon.svg 在Chrome
2. 右键 → Save Image As → PNG
3. 在Photoshop/GIMP中调整尺寸

## Temporary Workaround

当前扩展可以直接使用 icon.svg (Chrome支持)。
PNG图标可以稍后添加。
