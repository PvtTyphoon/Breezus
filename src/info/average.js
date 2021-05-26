const BreezusCommand = require("../../classes/command");
const rp = require("request-promise");
var unixtime = require("unixtime");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class averageCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "average",
			aliases: ["averages", "avg", "sa", "averagescrobbles"],
			group: "core",
			memberName: "average",
			description: stripIndents`
			Displays the average scrobble count for users between multiple time periods.
			> Example Usage: .averages <user>
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user);
		} catch (err) {
			handleError(err, message);
			return;
		}
		message.channel.send(stripIndents`
		>>> Scrobble averages for ${userData.user}
		\`\`\`
		Last 24 hours: ${data[0]} scrobbles per day.
		Last 7 days: ${data[1]} scrobbles per day.
		Last 30 days: ${data[2]} scrobbles per day.
		Last 6 months: ${data[3]} scrobbles per day.
		Last 12 months: ${data[4]} scrobbles per day.
		\`\`\`
		`);
	}

	async fetchData(user) {
		var now = unixtime();
		var timeRanges = [now - 86400, now - 604800, now - 2592000, now - 15768000];
		var averagePeriods = [1, 7, 30, 180, 365];
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
		for (let i = 0; i <= 4; i++) {
			options.qs.from = timeRanges[i];
			const rData = await rp(options);
			const count = rData.recenttracks["@attr"].total;
			data.push(Math.round(count / averagePeriods[i]));
		}
		return data;
	}
};
