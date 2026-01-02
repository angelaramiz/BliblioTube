export class User {
  constructor(id, email, username, createdDate = new Date().getTime()) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.createdDate = createdDate;
  }

  static fromJSON(json) {
    return new User(json.id, json.email, json.username, json.createdDate);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      createdDate: this.createdDate,
    };
  }
}
