const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const Discord = require("discord.js");
const rp = require("request-promise");
const unixtime = require("unixtime");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys, users } = require("../../config.json");
const now = unixtime();
const { stripIndents } = require("common-tags");
let medals = {
	"0": "🥇  ",
	"1": "🥈  ",
	"2": "🥉  ",
	"3": " 4.    ",
	"4": " 5.    ",
	"5": " 6.    ",
	"6": " 7.    ",
	"7": " 8.    ",
	"8": " 9.    ",
	"9": " 10.  ",
	"10": " 11.  ",
	"11": " 12.  ",
	"12": " 13.  ",
	"13": " 14.  ",
	"14": " 15.  ",
	"15": " 16.  ",
	"16": " 17.  ",
	"17": " 18.  ",
	"18": " 19.  ",
	"19": " 20.  ",
	"20": " 21.  ",
	"21": " 22.  ",
	"22": " 23.  ",
	"23": " 24.  ",
	"24": " 25.  ",
};

module.exports = class leaderboardListCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "leaderboardlist",
			aliases: ["lbl"],
			group: "core",
			memberName: "leaderboardlist",
			description: stripIndents`
			Generates a leaderboard.
			\`\`\`Example Usage: .lbl <day|7day|30day|3month|6month|12year|overall>\`\`\`
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
		const data = await this.fetchData(period);
		const lb = [];
		for (let i = 0; i < data.scrobbleLabel.length; i++) {
			lb.push(`${medals[i]}${data.scrobbleLabel[i]}`);
		}
		const embed = new BreezusEmbed(message).setDescription(lb.join("\n"));
		message.channel.send({ embed });
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
		var scrobbleLabel = [];
		for (let i = 0; i < users.length; i++) {
			options.qs.user = users[i];
			const rData = await rp(options);
			scrobbleLabel.push({
				label: `[${users[i]}](https://www.last.fm/user/${users[i]}): ${rData.recenttracks["@attr"].total} scrobbles`,
				count: rData.recenttracks["@attr"].total,
			});
		}
		scrobbleLabel.sort(function (a, b) {
			return b.count - a.count;
		});
		var scrobbleLabel = scrobbleLabel.map(
			(scrobbleLabel) => scrobbleLabel.label,
		);
		const data = {
			scrobbleLabel,
		};
		return data;
	}
};
