const users = [];

class User {
  constructor(name) {
    this.name = name;
  }

  save() {
    const users = User.getAll();
    users.push(this.toJSON());
    return users;
  }

  toJSON() {
    return {
      name: this.name,
    };
  }

  static getAll() {
    return users;
  }

  static getByName(name) {
    const users = User.getAll();
    return users.find((el) => el.name.toLowerCase() === name.toLowerCase());
  }

  static deleteUser(name) {
    let users = User.getAll();
    const index = users.findIndex((el) => el.name === name);

    if (index !== -1) {
      users.splice(index, 1);
    }

    return users;
  }
}

module.exports = User;
