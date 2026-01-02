export class Reminder {
  constructor(id, videoId, time, frequency = 'once', dayOfWeek = null, intervalDays = null) {
    this.id = id;
    this.videoId = videoId;
    this.time = time; // HH:mm formato
    this.frequency = frequency; // 'once', 'daily', 'weekly', 'custom'
    this.dayOfWeek = dayOfWeek; // 0-6 (domingo-sábado) para frecuencia semanal
    this.intervalDays = intervalDays; // cada X días
    this.isActive = true;
  }

  static fromJSON(json) {
    return new Reminder(
      json.id,
      json.videoId,
      json.time,
      json.frequency,
      json.dayOfWeek,
      json.intervalDays
    );
  }

  toJSON() {
    return {
      id: this.id,
      videoId: this.videoId,
      time: this.time,
      frequency: this.frequency,
      dayOfWeek: this.dayOfWeek,
      intervalDays: this.intervalDays,
      isActive: this.isActive,
    };
  }
}
