export class VideoMetadataExtractor {
  static extractPlatform(url) {
    if (!url) return 'desconocida';

    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    } else if (lowerUrl.includes('instagram.com') || lowerUrl.includes('reel')) {
      return 'instagram';
    } else if (lowerUrl.includes('tiktok.com')) {
      return 'tiktok';
    } else if (lowerUrl.includes('facebook.com')) {
      return 'facebook';
    } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return 'twitter';
    } else if (lowerUrl.includes('vimeo.com')) {
      return 'vimeo';
    } else if (lowerUrl.includes('twitch.tv')) {
      return 'twitch';
    } else {
      return 'otro';
    }
  }

  static getYouTubeVideoId(url) {
    if (!url) return null;

    try {
      if (url.includes('youtube.com')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
      } else if (url.includes('youtu.be')) {
        const urlObj = new URL(url);
        return urlObj.pathname.slice(1);
      }
    } catch (error) {
      console.error('Error extrayendo ID de YouTube:', error);
    }
    return null;
  }

  static getYouTubeThumbnail(url) {
    const videoId = this.getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  }

  static extractInstagramThumbnail(url) {
    // Para Instagram, necesitaremos una estrategia diferente (web scraping o API)
    return null;
  }

  static extractTitleFromUrl(url, platform) {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      
      // YouTube: extraer ID del video y hacer una request para obtener título
      if (platform === 'youtube') {
        const videoId = this.getYouTubeVideoId(url);
        if (videoId) {
          // Returnar un título placeholder que el usuario puede editar
          return `Video de YouTube (${videoId.substring(0, 8)}...)`;
        }
      }

      // Instagram: extraer del pathname
      if (platform === 'instagram') {
        const match = url.match(/\/p\/([^/?]+)/);
        if (match) return 'Publicación de Instagram';
      }

      // TikTok: extraer del pathname
      if (platform === 'tiktok') {
        const match = url.match(/video\/(\d+)/);
        if (match) return 'Video de TikTok';
      }

      // Twitter/X: extraer status ID
      if (platform === 'twitter') {
        return 'Tweet de X (Twitter)';
      }

      // Facebook: extraer video ID
      if (platform === 'facebook') {
        return 'Video de Facebook';
      }

      // Vimeo: extraer video ID
      if (platform === 'vimeo') {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (match) return 'Video de Vimeo';
      }

      // Twitch: extraer del pathname
      if (platform === 'twitch') {
        const pathname = urlObj.pathname;
        const match = pathname.match(/\/videos\/(\d+)/);
        if (match) return 'Video de Twitch';
      }
    } catch (error) {
      console.error('Error extrayendo título:', error);
    }

    return null;
  }

  static getPlatformColor(platform) {
    const colors = {
      youtube: '#FF0000',
      instagram: '#E4405F',
      tiktok: '#000000',
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      vimeo: '#1AB7EA',
      twitch: '#9146FF',
      otro: '#6366f1',
    };
    return colors[platform] || colors.otro;
  }

  static getPlatformIcon(platform) {
    const icons = {
      youtube: '▶️',
      instagram: '📷',
      tiktok: '🎵',
      facebook: 'f',
      twitter: '𝕏',
      vimeo: '▶️',
      twitch: '🎮',
      otro: '🎬',
    };
    return icons[platform] || icons.otro;
  }
}
