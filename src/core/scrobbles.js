const BreezusCommand = require("../../classes/command");
const rp = require("request-promise");
var unixtime = require("unixtime");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class scrobblesCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "scrobbles",
			aliases: ["s"],
			group: "core",
			memberName: "scrobbles",
			description:
				"Displays the scrobble count for users between multiple time periods.",
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		let userData = await getUser(message);
		if (userData.error) return message.reply(userData.error);
		var data;
		try {
			data = await this.fetchData(userData.user);
		} catch (err) {
			handleError(err, message);
			return;
		}
		message.channel.send(stripIndents`
		Scrobbles for ${userData.user}
		\`\`\`
		Last 24 hours: ${data[0]}
		Last 7 days: ${data[1]}
		Last 30 days: ${data[2]}
		Last 6 months: ${data[3]}
		Last 12 months: ${data[4]}
		Overall: ${data[5]}
		\`\`\`
		`);
	}

	async fetchData(user) {
		var now = unixtime();
		var timeRanges = [
			now - 86400,
			now - 604800,
			now - 2592000,
			now - 15768000,
			now - 31536000,
		];

		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getrecenttracks",
				user: user,
				api_key: keys[0],
				format: "json",
				from: "0",
				limit: "1",
			},
		};
		var data = [];
		for (let i = 0; i <= 5; i++) {
			options.qs.from = timeRanges[i];
			const rData = await rp(options);
			const count = rData.recenttracks["@attr"].total;
			data.push(count);
		}
		return data;
	}
};
