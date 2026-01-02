export class Folder {
  constructor(id, userId, name, color = '#6366f1', createdDate = new Date().getTime()) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.color = color;
    this.createdDate = createdDate;
  }

  static fromJSON(json) {
    return new Folder(json.id, json.userId, json.name, json.color, json.createdDate);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      color: this.color,
      createdDate: this.createdDate,
    };
  }
}
