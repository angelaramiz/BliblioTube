export class Video {
  constructor(id, folderId, title, url, platform, thumbnail, description, savedDate, reminders = [], importance = 3) {
    this.id = id;
    this.folderId = folderId;
    this.title = title;
    this.url = url;
    this.platform = platform; // 'youtube', 'instagram', 'tiktok', 'reels', etc.
    this.thumbnail = thumbnail;
    this.description = description;
    this.savedDate = savedDate; // timestamp
    this.reminders = reminders; // array de recordatorios
    this.importance = importance; // 1-5 nivel de importancia
  }

  static fromJSON(json) {
    return new Video(
      json.id,
      json.folderId,
      json.title,
      json.url,
      json.platform,
      json.thumbnail,
      json.description,
      json.savedDate,
      json.reminders ? JSON.parse(json.reminders) : [],
      json.importance || 3
    );
  }

  toJSON() {
    return {
      id: this.id,
      folderId: this.folderId,
      title: this.title,
      url: this.url,
      platform: this.platform,
      thumbnail: this.thumbnail,
      description: this.description,
      savedDate: this.savedDate,
      reminders: JSON.stringify(this.reminders),
    };
  }
}
