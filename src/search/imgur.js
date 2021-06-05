const BreezusCommand = require("../../classes/command");
const { stripIndents } = require("common-tags");
const { imgurID } = require("../../config.json");

var imgur = require("imgur");
imgur.setClientId(imgurID);
imgur.getClientId();

module.exports = class lookupCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "imgur",
			group: "search",
			memberName: "imgur",
			description: stripIndents`
			Uploads the attachments of a message to Imgur and returns a link. Multiple attachments will return an album url. Images mapped by their snowflake IDs.
			> Example Usage: .imgur (Image attached to message)
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
		try {
			var albumID = await imgur.createAlbum();
			var link;
			// this could be neated but i wrote this in 2 minutes lol sorry
			if (message.attachments.size == 1) {
				var json = await imgur.uploadUrl(message.attachments.first().url);
				link = json.data.link;
			} else {
				message.attachments.forEach(async (attachment) => {
					imgur.uploadUrl(attachment.url, albumID.data.deletehash);
				});
				link = `https://imgur.com/a/${albumID.data.id}`;
			}
			message.channel.send(stripIndents`
			Link: ${link}
			Delete Link: <https://imgur.com/delete/${albumID.data.deletehash}>
			`);
		} catch (err) {
			message.reply(err.message);
		}
	}
};
