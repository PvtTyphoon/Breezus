const BreezusCommand = require("../../classes/command");
const Discord = require("discord.js");
const rp = require("request-promise");
const unixtime = require("unixtime");
const { generateBarChart } = require("../../util/charts/barChart");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys, users } = require("../../config.json");
const now = unixtime();
const { stripIndents } = require("common-tags");

module.exports = class leaderboardCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "leaderboard",
			aliases: ["lb"],
			group: "charts",
			memberName: "leaderboard",
			description: stripIndents`
			Generates a scrobble leaderboard bar chart.
			\`\`\`Example Usage: .lb <day|7day|30day|3month|6month|year|overall>\`\`\`			
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		var period;
		var dText;
		switch (args[0]) {
			case "day":
			case "24hr":
			case "d":
			case "days":
				period = now - 86400;
				dText = "`1 day`";
				break;

			case "7day":
			case "7days":
			case "7d":
				period = now - 604800;
				dText = "`7 days`";
				break;

			case "month":
			case "30day":
			case "30days":
			case "30d":
				period = now - 2592000;
				dText = "`30 days`";
				break;

			case "6month":
			case "6months":
			case "6m":
			case "180d":
				period = now - 15768000;
				dText = "`6 months`";
				break;

			case "year":
			case "12month":
			case "12months":
			case "12m":
			case "1y":
				period = now - 31536000;
				dText = "`1 year`";
				break;

			case "overall":
			case "alltime":
			case "total":
			case "all":
				period = 1009843200;
				dText = "`overall`";
				break;

			default:
				period = now - 604800;
				dText = `\`7 days (default)\``;
		}
		try {
			const data = await this.fetchData(period);
			let image = await generateBarChart(
				data.count,
				data.label,
				data.scrobbleLabel,
			);
			const attachment = new Discord.Attachment(image);
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
