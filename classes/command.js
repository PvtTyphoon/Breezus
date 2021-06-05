const { Command } = require("discord.js-commando");

module.exports = class BreezusCommand extends Command {
  constructor(client, info) {
    super(client, info);
    this.throttling = info.throttling || {
      _usages: 1,
      get usages() {
        return this._usages;
      },
      set usages(value) {
        this._usages = value;
      },
      duration: 1,
    };
    this.credit = info.credit || [];
    this.credit.push({
      _name: "TyphoonsNotABot",
      get name() {
        return this._name;
      },
      set name(value) {
        this._name = value;
      },
      url: "https://github.com/PvtTyphoon",
    });
    this.guildOnly = true;
  }
};
