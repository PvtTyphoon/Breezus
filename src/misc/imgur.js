const BreezusCommand = require("../../classes/command");
const { stripIndents } = require("common-tags");
const { imgurID } = require("../../config.json");

var imgur = require("imgur");
imgur.setClientId(imgurID);
imgur.getClientId();

module.exports = class imgCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "imgur",
			aliases: ["img"],
			group: "misc",
			memberName: "imgur",
			description: stripIndents`
			Uploads the first attachment of a message to Imgur and returns a link.  Images mapped by their snowflake IDs.
			\`\`\`Example Usage: .imgur (Image attached to message)\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		if (!message.attachments.first())
			return message.reply(stripIndents`
		⚠️ You must attach an image submission to this message.  Attachment not found or discord failed to provide a link.
		`);
		var imagelink = message.attachments.first().url;
		imgur
			.uploadUrl(imagelink)
			.then(function (json) {
				message.channel.send(stripIndents`
			Link: ${json.data.link}
			Delete Link: <https://imgur.com/delete/${json.data.deletehash}>
			`);
			})
			.catch(function (err) {
				message.channel.send(err.message);
			});
	}
};
