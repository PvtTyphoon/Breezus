const BreezusCommand = require("../../classes/command");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const prettyMilliseconds = require("pretty-ms");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { notEnoughDataError } = require("../../errorHandling/customErrors");
const { apiRoot, keys } = require("../../config.json");

module.exports = class lastScrobbleCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "lastscrobble",
			aliases: ["la"],
			group: "core",
			memberName: "lastscrobble",
			description: 
				"Displays the time a user last scrobbled.",
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
		${data.description}
		Profile link: ${data.purl}
		`);
	}

	async fetchData(user) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getrecenttracks",
				user: user,
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};
		const rData = await rp(options);

		if(!rData.recenttracks.track.length) throw new notEnoughDataError(user);

		const data = {
			purl: `https://www.last.fm/user/${rData.recenttracks["@attr"].user}`,
			description: !rData.recenttracks.track[0]["@attr"]
				? stripIndents`Currently not listening. Last scrobbled at ${
						rData.recenttracks.track[0].date["#text"]
		};
				Or \`${prettyMilliseconds(
					Date.now() - rData.recenttracks.track[0].date.uts * 1000,
				)}\` ago.
				`
				: "Now scrobbling. ",
		};
		return data;
	}
};
