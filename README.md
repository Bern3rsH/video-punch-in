# Video Punch In 🎬

<p align="center">
  <img src="public/icon/128.png" alt="Video Punch In Icon" width="128" height="128">
</p>

<p align="center">
  <strong>One-click copy video timestamp links, precisely locate to any playback moment</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#supported-platforms">Supported Platforms</a> •
  <a href="#development">Development</a> •
  <a href="./README_CN.md">中文文档</a>
</p>

---

## Features

✨ **One-Click Copy** - Instantly copy video URL with current timestamp  
🎯 **Precise Timing** - Captures the exact second you're watching  
🔗 **Universal Format** - Generates `?t=seconds` format compatible with most platforms  
⌨️ **Keyboard Shortcut** - Quick access with `Ctrl+Shift+C` (Mac: `⌃+Shift+C`)  
🖱️ **Context Menu** - Right-click on any video to copy timestamp link  
📺 **Ad Detection** - Smart detection for YouTube ads  
🌐 **Bilingual Support** - English and Chinese localization  

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/video-punch-in.git
   cd video-punch-in
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build
   ```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` folder

## Usage

### Method 1: Popup Button
1. Navigate to any page with a video
2. Play the video to your desired position
3. Click the extension icon in your toolbar
4. Click "Click to punch & copy"
5. The timestamped URL is now in your clipboard!

### Method 2: Keyboard Shortcut
- **Windows/Linux**: `Alt+Shift+C`
- **Mac**: `⌃+Shift+C` (Control+Shift+C)

### Method 3: Context Menu
1. Right-click anywhere on the video page
2. Select "Punch and Copy Link"

## Supported Platforms

The extension works on **any website with HTML5 video**. Special ad detection is available for:

| Platform | Ad Detection |
|----------|--------------|
| YouTube | ✅ |
| Other platforms | Video detection only |

## How It Works

1. **Video Detection** - Finds the main video by identifying the largest visible video element with valid playback progress
2. **Ad Detection** - Checks platform-specific DOM elements to determine if an ad is playing
3. **URL Generation** - Appends `?t=<seconds>` to the current page URL
4. **Clipboard Copy** - Uses the Clipboard API to copy the generated URL
5. **Visual Feedback** - Displays a notification overlay on the video player

## Development

### Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **UI**: React 19
- **Language**: TypeScript
- **Package Manager**: pnpm

### Scripts

```bash
# Development mode (Chrome)
pnpm dev

# Development mode (Firefox)
pnpm dev:firefox

# Production build (Chrome)
pnpm build

# Production build (Firefox)
pnpm build:firefox

# Create extension zip
pnpm zip

# Type checking
pnpm compile
```

### Project Structure

```
video-punch-in/
├── entrypoints/
│   ├── background.ts      # Service worker & message handling
│   └── popup/             # Extension popup UI
│       ├── App.tsx
│       ├── App.css
│       └── main.tsx
├── utils/
│   ├── ad-detector.ts     # Platform-specific ad detection
│   ├── video-detector.ts  # Main video detection logic
│   └── injected-script.ts # Scripts injected into pages
├── public/
│   ├── _locales/          # i18n translations
│   │   ├── en/
│   │   └── zh_CN/
│   └── icon/              # Extension icons
└── wxt.config.ts          # WXT configuration
```

## Permissions

This extension requires the following permissions:

- `activeTab` - Access the current tab to detect videos
- `scripting` - Inject scripts to read video information
- `clipboardWrite` - Copy the generated URL to clipboard
- `contextMenus` - Add right-click menu option

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">Made with ❤️ for video enthusiasts</p>
