const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const unixtime = require("unixtime");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/chartsUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys, imgurID } = require("../../config.json");
const now = unixtime();

module.exports = class statsCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "stats",
			aliases: ["statistics"],
			group: "info",
			memberName: "stats",
			description: stripIndents`
			Displays statistics for a user in a given time period.
			\`\`\`Example Usage: .stats <7day|30day|3months|6months|year|overall> | <user>\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		var period;
		var unixTime;
		var dText;
		var days;
		switch (args[0]) {
			case "7day":
			case "7days":
			case "7d":
				period = "7day";
				dText = "`7 days`";
				unixTime = now - 604800;
				days = 7;
				break;

			case "month":
			case "30day":
			case "30days":
			case "30d":
				period = "1month";
				dText = "`30 days`";
				unixTime = now - 2592000;
				days = 30;
				break;

			case "3month":
			case "3months":
			case "3m":
				period = "3month";
				dText = "`3 months`";
				unixTime = now - 7884000;
				days = 90;
				break;

			case "6month":
			case "6months":
			case "6m":
				period = "6month";
				dText = "`6 months`";
				unixTime = 15768000;
				days = 180;
				break;

			case "year":
			case "12month":
			case "12months":
			case "12m":
			case "1y":
				period = "12month";
				dText = "`1 year`";
				unixTime = now - 31536000;
				days = 365;
				break;

			default:
				period = "7day";
				dText = `\`7 days (default)\``;
				days = 7;
				unixTime = now - 604800;
		}
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user, period, unixTime);
		} catch (err) {
			handleError(err, message);
			return;
		}

		const embed = new BreezusEmbed(message)
			.setDescription(
				stripIndents`
            [View profile for ${data.username}](${data.url})
                Statistics for ${dText}
                `,
			)
			.addField(
				`❯ Counts for ${dText}`,
				stripIndents`
			 Tracks: ${data.trackCount}
			 Albums: ${data.albumCount}
       Artists: ${data.artistCount}
			 Scrobbles: ${data.scrobbles}
				`,
				false,
			)
			.addField(
				`❯ Statistics for ${data.username} for ${dText}`,
				stripIndents`
				${data.username} averaged ${Math.round(data.trackCount / days)} tracks per day.
				${data.username} averaged ${Math.round(data.albumCount / days)} albums per day.
				${data.username} averaged ${Math.round(
					data.artistCount / days,
				)} artists per day.
				${data.username} averaged ${Math.round(
					data.scrobbles / days,
				)} scrobbles per day.
				`,
				false,
			);
		message.channel.send({ embed });
	}
	async fetchData(user, timePeriod, unixTime) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getRecentTracks",
				user: user,
				from: unixTime,
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};
		const rData = await rp(options);

		var albumOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopalbums",
				user: user,
				api_key: keys[1],
				period: timePeriod,
				format: "json",
				limit: "1",
			},
		};
		const albumData = await rp(albumOptions);

		var artistOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopartists",
				user: user,
				api_key: keys[2],
				period: timePeriod,
				format: "json",
				limit: "1",
			},
		};
		const artistData = await rp(artistOptions);

		var trackOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettoptracks",
				user: user,
				api_key: keys[3],
				period: timePeriod,
				format: "json",
				limit: "1",
			},
		};
		const trackData = await rp(trackOptions);

		var data = {
			username: user,
			scrobbles: rData.recenttracks["@attr"].total,
			url: `https://www.last.fm/user/${user}`,
			trackCount: trackData.toptracks["@attr"].total,
			artistCount: artistData.topartists["@attr"].total,
			albumCount: albumData.topalbums["@attr"].total,
		};
		return data;
	}
};
