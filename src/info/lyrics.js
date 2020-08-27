const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const solenolyrics = require("solenolyrics");
const { api } = require("../../assets/json/errors.json");
const { shorten } = require("../../util/TextMods");
const { colourGen } = require("../../util/Util");
const { stripIndents } = require("common-tags");

module.exports = class lyricsCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "lyrics",
			aliases: ["lyric"],
			group: "info",
			memberName: "lyrics",
			description: stripIndents`
			Fetches the lyrics for a song.
			\`\`\`Example Usage: .lyrics [song name]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var data = await this.fetchLyrics(message);
		const embed = new BreezusEmbed(message)
			.setTitle(`${data.title} - ${data.author}`)
			.setDescription(shorten(data.lyrics, 2000))
			.setThumbnail(data.icon);
		message.channel.send({ embed });
	}

	async fetchLyrics(message) {
		const args = message.content.trim().split(/ +/g).slice(1);
		if (args.length === 0) return message.reply(`No search query provided.`);
		let songname = args.join(" ");
		process.on("uncaughtException", function (err) {
			message.channel.send(err.message);
		});
		try {
			var lyrics = await solenolyrics.requestLyricsFor(songname);
			var title = await solenolyrics.requestTitleFor(songname);
			var author = await solenolyrics.requestAuthorFor(songname);
			var icon = await solenolyrics.requestIconFor(songname);
		} catch (err) {
			message.reply(api);
			return;
		}
		const data = {
			lyrics,
			title,
			author,
			icon,
		};
		return data;
	}
};
