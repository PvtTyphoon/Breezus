const BreezusCommand = require("../../classes/command");
const Discord = require("discord.js");
const rp = require("request-promise");
const { generateBarChart } = require("../../util/charts/barChart");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys, users } = require("../../config.json");
const { stripIndents } = require("common-tags");
const { parseTimePeriod } = require("../../util/Util");

module.exports = class leaderboardCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "leaderboard",
			aliases: ["lb"],
			group: "charts",
			memberName: "leaderboard",
			description: stripIndents`
			Generates a scrobble leaderboard bar chart.
			> Example Usage: .lb <7day|30day|3month|6month|year|overall>	
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		var { period, dText } = parseTimePeriod(args[0]);
		try {
			const data = await this.fetchData(period);
			let image = await generateBarChart(
				data.count,
				data.label,
				data.scrobbleLabel,
			);
			const attachment = new Discord.MessageAttachment(image);
			message.channel.send(`Scrobble leaderboard for ${dText}`, attachment);
		} catch (err) {
			handleError(err, message);
			return;
		}
	}

	async fetchData(period) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getrecenttracks",
				format: "json",
				api_key: keys[3],
				from: period,
				limit: "1",
			},
		};
		const label = [];
		const count = [];
		const scrobbleLabel = [];
		for (let i = 0; i < users.length; i++) {
			options.qs.user = users[i];
			const rData = await rp(options);
			label.push(users[i]);
			count.push(rData.recenttracks["@attr"].total);
			scrobbleLabel.push(
				`${users[i]}: ${rData.recenttracks["@attr"].total} scrobbles`,
			);
		}
		const data = {
			label,
			count,
			scrobbleLabel,
		};
		return data;
	}
};
