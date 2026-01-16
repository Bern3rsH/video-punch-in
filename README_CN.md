# 视频打孔器 🎬

<p align="center">
  <img src="public/icon/icon-128.png" alt="视频打孔器图标" width="128" height="128">
</p>

<p align="center">
  <strong>一键复制带时间戳的视频链接，精准定位到当前播放位置</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#安装方式">安装方式</a> •
  <a href="#使用方法">使用方法</a> •
  <a href="#支持平台">支持平台</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="./README.md">English</a>
</p>

---

## 功能特性

✨ **一键复制** - 即时复制带当前时间戳的视频链接  
🎯 **精准定位** - 精确捕获当前观看的秒数  
🔗 **通用格式** - 生成 `?t=秒数` 格式，兼容大多数平台  
⌨️ **快捷键** - `Ctrl+Shift+C` (Mac: `⌃+Shift+C`) 快速访问  
🖱️ **右键菜单** - 在任意视频页面右键即可复制时间戳链接  
📺 **广告检测** - 智能检测 YouTube 广告  
🌐 **双语支持** - 中英文本地化  

## 安装方式

### 从源码安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/video-punch-in.git
   cd video-punch-in
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 构建扩展：
   ```bash
   pnpm build
   ```

4. 在 Chrome 中加载扩展：
   - 打开 `chrome://extensions/`
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `.output/chrome-mv3` 文件夹

## 使用方法

### 方式一：弹出窗口按钮
1. 打开任意包含视频的网页
2. 播放视频到你想要的位置
3. 点击工具栏中的扩展图标
4. 点击「立即打孔并复制链接」
5. 带时间戳的链接已复制到剪贴板！

### 方式二：键盘快捷键
- **Windows/Linux**: `Alt+Shift+C`
- **Mac**: `⌃+Shift+C` (Control+Shift+C)

### 方式三：右键菜单
1. 在视频页面任意位置右键
2. 选择「立即打孔并复制链接」

## 支持平台

本扩展适用于**任何包含 HTML5 视频的网站**。以下平台有专门的广告检测：

| 平台 | 广告检测 |
|------|---------|
| YouTube | ✅ |
| 其他平台 | 仅视频检测 |

## 工作原理

1. **视频检测** - 通过查找可视区域最大且有有效播放进度的视频元素来定位主视频
2. **广告检测** - 检查各平台特定的 DOM 元素来判断是否在播放广告
3. **URL 生成** - 将 `?t=<秒数>` 添加到当前页面 URL
4. **剪贴板复制** - 使用 Clipboard API 复制生成的链接
5. **视觉反馈** - 在视频播放器上显示通知覆盖层

## 开发指南

### 技术栈

- **框架**: [WXT](https://wxt.dev/) - 新一代 Web 扩展框架
- **UI**: React 19
- **语言**: TypeScript
- **包管理器**: pnpm

### 脚本命令

```bash
# 开发模式 (Chrome)
pnpm dev

# 开发模式 (Firefox)
pnpm dev:firefox

# 生产构建 (Chrome)
pnpm build

# 生产构建 (Firefox)
pnpm build:firefox

# 创建扩展压缩包
pnpm zip

# 类型检查
pnpm compile
```

### 项目结构

```
video-punch-in/
├── entrypoints/
│   ├── background.ts      # Service Worker 和消息处理
│   └── popup/             # 扩展弹出窗口 UI
│       ├── App.tsx
│       ├── App.css
│       └── main.tsx
├── utils/
│   ├── ad-detector.ts     # 平台特定广告检测
│   ├── video-detector.ts  # 主视频检测逻辑
│   └── injected-script.ts # 注入页面的脚本
├── public/
│   ├── _locales/          # 国际化翻译
│   │   ├── en/
│   │   └── zh_CN/
│   └── icon/              # 扩展图标
└── wxt.config.ts          # WXT 配置
```

## 权限说明

本扩展需要以下权限：

- `activeTab` - 访问当前标签页以检测视频
- `scripting` - 注入脚本以读取视频信息
- `clipboardWrite` - 将生成的链接复制到剪贴板
- `contextMenus` - 添加右键菜单选项

## 许可证

MIT License

## 贡献

欢迎贡献代码！请随时提交 Pull Request。

---

<p align="center">用 ❤️ 为视频爱好者打造</p>
