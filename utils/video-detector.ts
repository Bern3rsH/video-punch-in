/**
 * 视频检测工具
 * 用于在页面中查找用户正在观看的主视频
 */

export interface VideoInfo {
  currentTime: number;
  isAd: boolean;
  platform?: string;
}

/**
 * 计算视频元素在视口中的可见面积
 */
function getVisibleArea(video: HTMLVideoElement): number {
  const rect = video.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 计算视频与视口的交集
  const visibleLeft = Math.max(0, rect.left);
  const visibleTop = Math.max(0, rect.top);
  const visibleRight = Math.min(viewportWidth, rect.right);
  const visibleBottom = Math.min(viewportHeight, rect.bottom);

  // 如果没有交集，返回 0
  if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) {
    return 0;
  }

  return (visibleRight - visibleLeft) * (visibleBottom - visibleTop);
}

/**
 * 查找页面中可见面积最大的有效视频
 * @returns 视频的当前播放时间（秒），如果没有找到返回 null
 */
export function findMainVideo(): VideoInfo | null {
  const videos = document.querySelectorAll('video');

  let bestVideo: HTMLVideoElement | null = null;
  let maxVisibleArea = 0;

  for (const video of videos) {
    // 只要视频有有效时长和播放进度即可
    if (video.duration > 0 && video.currentTime > 0) {
      const visibleArea = getVisibleArea(video);
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        bestVideo = video;
      }
    }
  }

  if (bestVideo && maxVisibleArea > 0) {
    return {
      currentTime: Math.floor(bestVideo.currentTime),
      isAd: false,
    };
  }

  return null;
}
