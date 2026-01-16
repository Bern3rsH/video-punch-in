/**
 * 注入到页面执行的脚本
 * 注意：这个函数会被序列化后注入到目标页面执行，不能引用外部模块
 */

export interface InjectedScriptResult {
  currentTime?: number;
  isAd: boolean;
  platform?: string;
  /** 视频中心点位置 */
  videoCenter?: { x: number; y: number };
}

/**
 * 在目标页面执行的视频检测脚本
 * 此函数会被 browser.scripting.executeScript 注入执行
 */
export function getVideoTimestamp(): InjectedScriptResult | null {
  const hostname = window.location.hostname;

  // ========== 广告检测 ==========

  // YouTube 广告检测
  if (hostname.includes('youtube.com')) {
    const playerContainer = document.querySelector('.html5-video-player');
    if (playerContainer?.classList.contains('ad-showing')) {
      return { isAd: true, platform: 'youtube' };
    }
  }

  // ========== 视频检测 ==========

  const videos = document.querySelectorAll('video');

  // 计算视频在视口中的可见面积
  const getVisibleArea = (video: HTMLVideoElement): number => {
    const rect = video.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const visibleLeft = Math.max(0, rect.left);
    const visibleTop = Math.max(0, rect.top);
    const visibleRight = Math.min(viewportWidth, rect.right);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);

    if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) {
      return 0;
    }

    return (visibleRight - visibleLeft) * (visibleBottom - visibleTop);
  };

  // 找到可见面积最大的有效视频
  let bestVideo: HTMLVideoElement | null = null;
  let maxVisibleArea = 0;

  for (const video of videos) {
    if (video.duration > 0 && video.currentTime > 0) {
      const visibleArea = getVisibleArea(video);
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        bestVideo = video;
      }
    }
  }

  if (bestVideo && maxVisibleArea > 0) {
    const rect = bestVideo.getBoundingClientRect();
    return {
      currentTime: Math.ceil(bestVideo.currentTime),
      isAd: false,
      videoCenter: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
    };
  }

  return null;
}
