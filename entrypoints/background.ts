import { getVideoTimestamp } from '../utils/injected-script';

/**
 * 将秒数格式化为视频时间轴格式 (mm:ss 或 h:mm:ss)
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default defineBackground(() => {
  // 创建右键菜单
  browser.contextMenus.create({
    id: 'copy-video-timestamp',
    title: browser.i18n.getMessage('contextMenuTitle'),
    contexts: ['page', 'video'],
  });

  // 监听右键菜单点击
  browser.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId === 'copy-video-timestamp') {
      await copyVideoTimestampUrl();
    }
  });

  // 监听键盘快捷键命令
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'copy-video-timestamp') {
      await copyVideoTimestampUrl();
    }
  });

  // 监听来自 popup 的消息
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'copy-video-timestamp') {
      // 从 popup 调用，传入 fromPopup=true
      copyVideoTimestampUrl(true)
        .then((result) => {
          sendResponse(result);
        })
        .catch((error) => {
          console.error('Message handler error:', error);
          sendResponse({ status: 'error' });
        });
      return true;
    }

    if (message.action === 'show-notification') {
      showNotification(message.type, message.message, message.position).then(
        () => {
          sendResponse({ success: true });
        },
      );
      return true;
    }

    if (message.action === 'check-video') {
      checkVideoAvailable()
        .then((result) => {
          sendResponse(result);
        })
        .catch(() => {
          sendResponse({ hasVideo: false });
        });
      return true;
    }

    return false;
  });
});

/**
 * 复制当前视频时间戳 URL 到剪贴板
 * @param fromPopup 是否从 popup 调用（popup 调用时不复制，返回 URL 让 popup 复制）
 * @returns 操作结果
 */
async function copyVideoTimestampUrl(fromPopup: boolean = false): Promise<{
  status: 'success' | 'error' | 'ad';
  url?: string;
  videoCenter?: { x: number; y: number };
  currentTime?: number;
}> {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];

    if (!currentTab?.id || !currentTab?.url) {
      if (!fromPopup)
        await showNotification('error', browser.i18n.getMessage('errorNoTab'));
      return { status: 'error' };
    }

    // 注入脚本检测视频并获取时间戳
    const results = await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: getVideoTimestamp,
    });

    const videoInfo = results[0]?.result;

    if (!videoInfo) {
      if (!fromPopup)
        await showNotification(
          'error',
          browser.i18n.getMessage('errorNoVideo'),
        );
      return { status: 'error' };
    }

    if (videoInfo.isAd) {
      if (!fromPopup)
        await showNotification(
          'warning',
          browser.i18n.getMessage('errorAdPlaying'),
        );
      return { status: 'ad' };
    }

    // 生成带时间戳的 URL
    const url = new URL(currentTab.url);
    url.searchParams.set('t', String(videoInfo.currentTime));

    // 如果是从 popup 调用，返回 URL 让 popup 复制（因为页面没有焦点）
    if (fromPopup) {
      return {
        status: 'success',
        url: url.toString(),
        videoCenter: videoInfo.videoCenter,
        currentTime: videoInfo.currentTime,
      };
    }

    // 从右键菜单或快捷键调用时，直接复制（页面有焦点）
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: (text: string) => {
        navigator.clipboard.writeText(text);
      },
      args: [url.toString()],
    });

    await showNotification(
      'success',
      browser.i18n.getMessage('punchedAt', [
        formatTime(videoInfo.currentTime ?? 0),
      ]),
      videoInfo.videoCenter,
    );
    return { status: 'success' };
  } catch (error) {
    console.error('Failed to copy video timestamp URL:', error);
    if (!fromPopup)
      await showNotification(
        'error',
        browser.i18n.getMessage('errorCopyFailed'),
      );
    return { status: 'error' };
  }
}

/**
 * 检测页面是否有可用的视频
 */
async function checkVideoAvailable(): Promise<{
  hasVideo: boolean;
  isAd?: boolean;
}> {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];

    if (!currentTab?.id) {
      return { hasVideo: false };
    }

    const results = await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: getVideoTimestamp,
    });

    const videoInfo = results[0]?.result;

    if (!videoInfo) {
      return { hasVideo: false };
    }

    if (videoInfo.isAd) {
      return { hasVideo: true, isAd: true };
    }

    return { hasVideo: true };
  } catch {
    return { hasVideo: false };
  }
}

/**
 * 通过注入脚本显示通知
 * @param position 可选，指定通知显示的位置（如视频中心）
 */
async function showNotification(
  type: 'success' | 'warning' | 'error',
  message: string,
  position?: { x: number; y: number },
) {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  if (!currentTab?.id) return;

  const colors = {
    success: '#FF6B22',
    warning: '#FFB800',
    error: '#F44336',
  };

  await browser.scripting.executeScript({
    target: { tabId: currentTab.id },
    func: (msg: string, bgColor: string, pos?: { x: number; y: number }) => {
      // 创建通知元素
      const notification = document.createElement('div');
      notification.textContent = msg;

      // 根据是否有位置信息决定显示方式
      if (pos) {
        // 在视频中心显示（半透明）
        notification.style.cssText = `
          position: fixed;
          left: ${pos.x}px;
          top: ${pos.y}px;
          transform: translate(-50%, -50%) scale(0);
          padding: 12px 24px;
          background-color: rgba(0, 0, 0, 0.6);
          color: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 2147483647;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          pointer-events: none;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;
      } else {
        // 右上角显示
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background-color: ${bgColor};
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 999999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: slideIn 0.3s ease-out;
        `;
      }

      // 添加动画样式
      const style = document.createElement('style');
      style.id = 'video-punch-in-notification-style';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes popOut {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
      `;

      // 优先添加到 fullscreenElement，否则添加到 documentElement
      const container = document.fullscreenElement || document.documentElement;
      container.appendChild(style);
      container.appendChild(notification);

      // 2秒后移除
      setTimeout(() => {
        if (pos) {
          notification.style.animation = 'popOut 0.3s ease-in forwards';
        } else {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
        }
        setTimeout(() => {
          notification.remove();
          style.remove();
        }, 300);
      }, 1000);
    },
    args: [message, colors[type], position],
  });
}
