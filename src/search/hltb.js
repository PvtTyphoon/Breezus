const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const { handleError } = require("../../errorHandling/errorHandling");
const { notFound } = require("../../errorHandling/customErrors");
let hltb = require("howlongtobeat");
let hltbService = new hltb.HowLongToBeatService();

module.exports = class lookupCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "hltb",
			aliases: ["howlongtobeat"],
			group: "search",
			memberName: "hltb",
			description: stripIndents`
			A command fetching data about game completion from howlongtobeat.com
			> Example Usage: .hltb [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		let query = args.slice(0).join(" ");
		if (!query.length) return message.reply("Please provide a search query.");
		try {
			var data = await this.fetchData(query, message);
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message).setThumbnail(data.gameImage)
			.setDescription(stripIndents`
			Stats for **${data.gameName}**
			Game ID: [${data.gameID}](${data.gameURL})
			>>> ${data.gameplayMain}
			${data.gameplayExtra}
			${data.gameplayCompletionist}
			`);
		message.channel.send({ embed });
	}

	async fetchData(game, message) {
		var result = await hltbService.search(game);
		if (!result.length) throw new notFound(game);
		var game = result[0];
		var data = {
			gameName: game.name,
			gameID: game.id,
			gameURL: `https://howlongtobeat.com/game?id=${game.id}`,
			gameImage: `https://howlongtobeat.com${game.imageUrl}`,
			gameplayMain:
				`**${game.timeLabels[0][1]}:** ` + `${game.gameplayMain} hours.`,
			gameplayExtra:
				`**${game.timeLabels[1][1]}:** ` + `${game.gameplayMainExtra} hours.`,
			gameplayCompletionist:
				`**${game.timeLabels[2][1]}**: ` +
				`${game.gameplayCompletionist} hours.`,
		};
		return data;
	}
};
