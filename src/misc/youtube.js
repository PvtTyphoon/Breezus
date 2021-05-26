const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");
const { cleanHTML } = require("../../util/TextMods");
const { paginationEmbed } = require("../../util/pagination");
const { googleAPI } = require("../../config.json");

module.exports = class inspiroCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "youtube",
			aliases: ["yt"],
			group: "misc",
			memberName: "youtube",
			description: stripIndents`
			Searches youtube and returns the results.
			> Example Usage: .yt [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		let query = args.slice(0).join(" ");
		if (!query.length) return message.reply("Please provide a search query.");
		var data = await this.fetchData(query);
		var pages = [];

		for (let i = 0; i < data.length; i++) {
			const embed = new BreezusEmbed(message)
				.setDescription(
					stripIndents`
        [${data[i].videoTitle}](${data[i].videoURL}) 
        Uploaded by [${data[i].videoUploader}](${data[i].videoUploaderURL}) on **${data[i].videoUploaded}**
        
        "${data[i].videoDescription}"
        `,
				)
				.setImage(data[i].videoThumbnail);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
	}
	async fetchData(query) {
		var options = {
			uri: "https://www.googleapis.com/youtube/v3/search",
			json: true,
			qs: {
				part: "snippet",
				type: "video",
				maxResults: 50,
				q: query,
				key: googleAPI,
			},
		};
		const rData = await rp(options);
		var data = [];
		for (let i = 0; i < rData.items.length; i++) {
			data.push({
				videoID: rData.items[i].id.videoId,
				videoURL: `https://www.youtube.com/watch?v=${rData.items[i].id.videoId}`,
				videoTitle: cleanHTML(rData.items[i].snippet.title),
				videoDescription: cleanHTML(rData.items[i].snippet.description),
				videoThumbnail: rData.items[i].snippet.thumbnails.high.url,
				videoUploader: rData.items[i].snippet.channelTitle,
				videoUploaded: new Date(
					rData.items[i].snippet.publishTime,
				).toDateString(),
				videoUploaderURL: `https://www.youtube.com/channel/${rData.items[i].snippet.channelId}`,
			});
		}
		return data;
	}
};
