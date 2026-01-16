/**
 * 广告检测工具
 * 用于检测各视频平台是否正在播放广告
 */

export interface AdDetectionResult {
  isAd: boolean;
  platform: string;
}

/**
 * 各平台广告检测器配置
 */
interface AdDetectorConfig {
  /** 匹配的域名关键字 */
  hostPattern: string;
  /** 平台标识 */
  platform: string;
  /** 检测函数 */
  detect: () => boolean;
}

/**
 * 广告检测器列表
 */
const adDetectors: AdDetectorConfig[] = [
  {
    hostPattern: 'youtube.com',
    platform: 'youtube',
    detect: () => {
      const playerContainer = document.querySelector('.html5-video-player');
      return playerContainer?.classList.contains('ad-showing') ?? false;
    },
  },
  {
    hostPattern: 'v.qq.com',
    platform: 'qq',
    detect: () => {
      const qqAd =
        document.querySelector('.txp_ad') ||
        document.querySelector('[class*="txp_ads"]');
      return qqAd !== null;
    },
  },
  {
    hostPattern: 'iqiyi.com',
    platform: 'iqiyi',
    detect: () => {
      const iqiyiAd =
        document.querySelector('.iqp-player-pause-ad') ||
        document.querySelector('[class*="-ad-"]');
      return iqiyiAd !== null;
    },
  },
];

/**
 * 检测当前页面是否正在播放广告
 * @returns 广告检测结果，如果不是广告返回 null
 */
export function detectAd(): AdDetectionResult | null {
  const hostname = window.location.hostname;

  for (const detector of adDetectors) {
    if (hostname.includes(detector.hostPattern)) {
      if (detector.detect()) {
        return {
          isAd: true,
          platform: detector.platform,
        };
      }
      // 找到匹配的平台但没有检测到广告，继续检查（某些网站可能匹配多个规则）
    }
  }

  return null;
}

/**
 * 添加自定义广告检测器
 * @param config 检测器配置
 */
export function registerAdDetector(config: AdDetectorConfig): void {
  adDetectors.push(config);
}
