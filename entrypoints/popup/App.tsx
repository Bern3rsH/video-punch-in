import { useState, useEffect } from 'react';
import './App.css';

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

type CopyStatus = 'idle' | 'success' | 'error' | 'ad' | 'loading' | 'no-video';

function App() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('loading');

  // 在 popup 打开时检测页面是否有视频
  useEffect(() => {
    browser.runtime
      .sendMessage({ action: 'check-video' })
      .then((result: { hasVideo: boolean; isAd?: boolean }) => {
        if (!result.hasVideo) {
          setCopyStatus('no-video');
        } else if (result.isAd) {
          setCopyStatus('ad');
        } else {
          setCopyStatus('idle');
        }
      })
      .catch(() => {
        setCopyStatus('no-video');
      });
  }, []);

  const handleClick = async () => {
    if (copyStatus === 'no-video' || copyStatus === 'ad' || copyStatus === 'loading') {
      return;
    }

    try {
      const result = await browser.runtime.sendMessage({
        action: 'copy-video-timestamp',
      });

      if (result?.status !== 'success' || !result?.url) {
        setCopyStatus(result?.status === 'ad' ? 'ad' : 'error');
        setTimeout(() => setCopyStatus('idle'), 2000);
        return;
      }

      await navigator.clipboard.writeText(result.url);

      await browser.runtime.sendMessage({
        action: 'show-notification',
        type: 'success',
        message: browser.i18n.getMessage('punchedAt', [
          formatTime(result.currentTime ?? 0),
        ]),
        position: result.videoCenter,
      });

      setCopyStatus('success');
      // 复制成功后自动关闭弹窗
      setTimeout(() => window.close(), 1200);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const getStatusInfo = () => {
    switch (copyStatus) {
      case 'loading':
        return {
          emoji: '⏳',
          text: browser.i18n.getMessage('loading'),
          className: 'loading',
        };
      case 'no-video':
        return {
          emoji: '🚫',
          text: browser.i18n.getMessage('noVideo'),
          className: 'disabled',
        };
      case 'ad':
        return {
          emoji: '📺',
          text: browser.i18n.getMessage('adPlaying'),
          className: 'disabled',
        };
      case 'success':
        return {
          emoji: '🕳️',
          text: browser.i18n.getMessage('copied'),
          className: 'success',
        };
      case 'error':
        return {
          emoji: '❌',
          text: browser.i18n.getMessage('copyFailed'),
          className: 'error',
        };
      default:
        return {
          emoji: '🎬',
          text: browser.i18n.getMessage('clickToCopy'),
          className: '',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isDisabled = ['loading', 'no-video', 'ad'].includes(copyStatus);

  return (
    <button
      className={`popup-button ${statusInfo.className}`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <span className="emoji">{statusInfo.emoji}</span>
      <span className="text">{statusInfo.text}</span>
    </button>
  );
}

export default App;
