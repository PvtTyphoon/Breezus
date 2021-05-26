const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { apiRoot, keys, users } = require("../../config.json");
const { stripIndents } = require("common-tags");
const { parseTimePeriod, generateMedals } = require("../../util/Util");
const medals = generateMedals();

module.exports = class leaderboardListCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "leaderboardlist",
			aliases: ["lbl"],
			group: "core",
			memberName: "leaderboardlist",
			description: stripIndents`
			Generates a leaderboard.
			> Example Usage: .lbl <day|7day|30day|3month|6month|12year|overall>
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		var { period, dText } = parseTimePeriod(args[0]);
		const data = await this.fetchData(period);
		const lb = [];
		for (let i = 0; i < data.scrobbleLabel.length; i++) {
			lb.push(`${medals[i]}${data.scrobbleLabel[i]}`);
		}
		const embed = new BreezusEmbed(message).setDescription(stripIndents`
		__**Leaderboard for Breezus**__ 
		Time period: ${dText}
		
		${lb.join("\n")}
		`);
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
