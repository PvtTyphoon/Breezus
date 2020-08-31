const BreezusCommand = require("../../classes/command");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class albumCountCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "albumcount",
			aliases: ["ac", "albumcount"],
			group: "info",
			memberName: "albumcount",
			description: stripIndents`
			Displays the number of albums in a users library.
			\`\`\`Example Usage: .albumcount <user>\`\`\`
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
		${data.user} has ${data.count} albums scrobbled since ${data.joined}
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
				method: "user.gettopalbums",
				user: user,
				api_key: keys[3],
				format: "json",
				limit: "1",
			},
		};
		const albumData = await rp(trackOptions);

		const data = {
			user,
			joined: new Date(rData.user.registered["#text"] * 1000),
			count: albumData.topalbums["@attr"].total,
		};
		return data;
	}
};
