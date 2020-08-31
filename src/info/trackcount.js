const BreezusCommand = require("../../classes/command");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class trackCountCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "trackcount",
			aliases: ["tc", "trackscount"],
			group: "info",
			memberName: "trackcount",
			description: stripIndents`
			Displays the number of tracks in a users library.
			\`\`\`Example Usage: .lib <user>\`\`\`
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
		${data.user} has ${data.count} tracks scrobbled since ${data.joined}
		`);
	}
	async fetchData(user) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getInfo",
				user: user,
				api_key: keys[0],
				format: "json",
			},
		};
		const rData = await rp(options);

		var trackOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettoptracks",
				user: user,
				api_key: keys[3],
				format: "json",
				limit: "1",
			},
		};
		const trackData = await rp(trackOptions);

		const data = {
			user,
			joined: new Date(rData.user.registered["#text"] * 1000),
			count: trackData.toptracks["@attr"].total,
		};
		return data;
	}
};
