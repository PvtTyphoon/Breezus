const BreezusCommand = require("../../classes/command");
const rp = require("request-promise");
const prettyMilliseconds = require("pretty-ms");
const { stripIndents } = require("common-tags");
const { handleError } = require("../../errorHandling/errorHandling");
const { getUser } = require("../../util/lastfmUserGetter");
const { apiRoot, keys, imgurID } = require("../../config.json");

var imgur = require("imgur");
imgur.setClientId(imgurID);
imgur.getClientId();

module.exports = class createdAtCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "createdat",
			aliases: ["ca", "age", "pa"],
			group: "core",
			memberName: "createdat",
			description: stripIndents`
			Displays a user profile's creation date.
			\`\`\`Example Usage: .ca <user>\`\`\`
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
			\`${data.username}\` created their account at \`${data.registered}\`
			Which was ${data.time} ago.
			Profile link: <${data.url}>
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
		const data = {
			username: user,
			registered: new Date(rData.user.registered["#text"] * 1000),
			time: prettyMilliseconds(
				Math.abs(Date.now() - new Date(rData.user.registered["#text"] * 1000)),
			),
			url: rData.user.url,
		};
		return data;
	}
};
